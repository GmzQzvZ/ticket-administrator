const path = require('path');
const { randomBytes, scrypt } = require('crypto');
const { promisify } = require('util');
const { readData, writeData } = require('../utils/fileUtils');

const scryptAsync = promisify(scrypt);
const usersPath = path.join(__dirname, '../data/users.json');

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
};

const verifyPassword = async (password, stored) => {
  if (!stored) return false;
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = await scryptAsync(password, salt, 64);
  return key === derived.toString('hex');
};

const createSessionToken = () => randomBytes(24).toString('hex');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const isEmailValid = (email) => {
  const normalized = email?.trim();
  if (!normalized) return false;
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalized);
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (![name, email, password].every(Boolean)) {
      return res.status(400).json({ message: 'Todos los campos (nombre, correo y contraseña) son obligatorios.' });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Los campos deben ser texto válido.' });
    }

    if (!isEmailValid(email)) {
      return res.status(400).json({ message: 'Correo electrónico inválido.' });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const users = await readData(usersPath);
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((user) => user.email === normalizedEmail)) {
      return res.status(400).json({ message: 'Usuario ya registrado.' });
    }

    const hashedPassword = await hashPassword(password.trim());

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    };

    users.push(newUser);
    await writeData(usersPath, users);

    res.status(201).json({
      message: 'Usuario registrado con éxito.',
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error('Register error', error);
    res.status(500).json({ message: 'No se pudo registrar al usuario en este momento.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña requeridos.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const users = await readData(usersPath);
    const user = users.find((user) => user.email === normalizedEmail);

    if (!user || !(await verifyPassword(trimmedPassword, user.password))) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    res.json({
      message: 'Inicio de sesión exitoso.',
      token: createSessionToken(),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'No se pudo iniciar sesión en este momento.' });
  }
};

exports.recoverPassword = async (req, res) => {
  try {
    const { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ message: 'Correo electrónico requerido.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = await readData(usersPath);
    const userExists = users.some((user) => user.email === normalizedEmail);

    const resetToken = createSessionToken();

    if (!userExists) {
      return res.json({
        message: 'Si el correo está registrado, recibirás instrucciones para restablecer la contraseña.',
      });
    }

    res.json({
      message: 'Si el correo está registrado, recibirás instrucciones para restablecer la contraseña.',
      resetToken,
    });
  } catch (error) {
    console.error('Recover password error', error);
    res.status(500).json({ message: 'No se pudo procesar la recuperación de contraseña.' });
  }
};
