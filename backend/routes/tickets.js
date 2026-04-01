const express = require('express');
const path = require('path');
const { readData, writeData } = require('../utils/fileUtils');

const router = express.Router();
const ticketsPath = path.join(__dirname, '../data/tickets.json');

const buildCaseNumber = (tickets) => {
  const maxIndex = tickets.reduce((max, ticket) => {
    const match = /^C(\d+)$/.exec(ticket.caseNumber);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  const nextIndex = String(maxIndex + 1).padStart(4, '0');
  return `C${nextIndex}`;
};

router.post('/', async (req, res) => {
  const {
    subject,
    status,
    client,
    category,
    service,
    responsible,
    priority,
    reason,
    description,
  } = req.body;

  if (!subject || !client) {
    return res.status(400).json({ message: 'Subject y cliente son obligatorios.' });
  }

  const tickets = await readData(ticketsPath);
  const newTicket = {
    caseNumber: buildCaseNumber(tickets),
    subject,
    createdAt: new Date().toISOString(),
    status: status || 'Abierto',
    client,
    category: category || 'Otro',
    service: service || 'Sin servicio',
    responsible: responsible || 'Sin asignar',
    author: 'Usuario local',
    reason: reason || 'Sin descripción',
    priority: priority || 'Media',
    description: description || '',
    eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  };

  tickets.unshift(newTicket);
  await writeData(ticketsPath, tickets);

  res.status(201).json(newTicket);
});

router.put('/:caseNumber', async (req, res) => {
  const {
    subject,
    status,
    client,
    category,
    service,
    responsible,
    priority,
    reason,
    description,
  } = req.body;

  const tickets = await readData(ticketsPath);
  const index = tickets.findIndex((ticket) => ticket.caseNumber === req.params.caseNumber);
  if (index === -1) {
    return res.status(404).json({ message: 'Caso no encontrado.' });
  }

  const updatedDescription = description !== undefined ? description : tickets[index].description || '';

  const updated = {
    ...tickets[index],
    subject: subject || tickets[index].subject,
    status: status || tickets[index].status,
    client: client || tickets[index].client,
    category: category || tickets[index].category,
    service: service || tickets[index].service,
    responsible: responsible || tickets[index].responsible,
    priority: priority || tickets[index].priority,
    reason: reason || tickets[index].reason,
    description: updatedDescription,
    updatedAt: new Date().toISOString(),
  };

  tickets[index] = updated;
  await writeData(ticketsPath, tickets);

  res.json(updated);
});

router.delete('/:caseNumber', async (req, res) => {
  const tickets = await readData(ticketsPath);
  const filtered = tickets.filter((ticket) => ticket.caseNumber !== req.params.caseNumber);

  if (filtered.length === tickets.length) {
    return res.status(404).json({ message: 'Caso no encontrado.' });
  }

  await writeData(ticketsPath, filtered);
  res.status(204).end();
});

module.exports = router;
