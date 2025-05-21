const fs = require('fs');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileUtils');

const usersPath = path.join(__dirname, '../data/users.json');

async function registerUser(req, res) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Faltan datos' });

    const users = await readJSON(usersPath);
    const exists = users.find(u => u.username === username);
    if (exists) return res.status(409).json({ message: 'Usuario ya existe' });

    users.push({ username, password });
    await writeJSON(usersPath, users);
    res.status(201).json({ message: 'Usuario registrado con éxito' });
}

async function loginUser(req, res) {
    const { username, password } = req.body;
    const users = await readJSON(usersPath);

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    res.status(200).json({ message: 'Login exitoso' });
}

module.exports = { registerUser, loginUser }