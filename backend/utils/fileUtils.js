const fs = require('fs');

function readJSON(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) return resolve([]); // si no existe, devolver array vacío
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function writeJSON(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8', err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { readJSON, writeJSON };