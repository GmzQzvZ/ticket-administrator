const path = require('path');
const { readData, writeData } = require('../utils/fileUtils');

const usersPath = path.join(__dirname, '../data/users.json');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const users = await readData(usersPath);

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Usuario ya registrado.' });
  }

  users.push({ name, email, password });
  await writeData(usersPath, users);
  res.status(201).json({ message: 'Usuario registrado con éxito.' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const users = await readData(usersPath);
  const user = users.find((user) => user.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  
};



exports.recoverPassword = async (req, res) => {
  const { email } = req.body;
  const users = await readData(usersPath);

 const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: 'Correo no registrado.' });
  }

  res.json({ message: 'Contraseña recuperada.', password: user.password });
};
