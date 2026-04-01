const express = require('express');
const path = require('path');
const { readData } = require('../utils/fileUtils');

const router = express.Router();

const datasets = {
  clients: 'clients.json',
  categories: 'categories.json',
  services: 'services.json',
  priorities: 'priorities.json',
  responsibles: 'responsibles.json',
  statuses: 'statuses.json',
  tickets: 'tickets.json',
};

router.get('/:dataset', async (req, res) => {
  const filename = datasets[req.params.dataset];
  if (!filename) {
    return res.status(404).json({ message: 'Dataset no encontrado.' });
  }

  const filePath = path.join(__dirname, '../data', filename);
  const data = await readData(filePath);

  res.json(data);
});

module.exports = router;
