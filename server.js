const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// ── helpers ──
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { members: [], tickets: [] };
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch(e) { return { members: [], tickets: [] }; }
}
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── MEMBERS ──
app.get('/api/members', (req, res) => {
  res.json(loadData().members);
});

app.post('/api/members', (req, res) => {
  const data = loadData();
  const m = { ...req.body, updatedAt: Date.now() };
  if (!m.name) return res.status(400).json({ error: 'name required' });
  const idx = data.members.findIndex(x => x.name.toLowerCase() === m.name.toLowerCase());
  if (idx >= 0) data.members[idx] = m;
  else data.members.push(m);
  saveData(data);
  res.json(m);
});

// ── TICKETS ──
app.get('/api/tickets', (req, res) => {
  res.json(loadData().tickets);
});

app.post('/api/tickets', (req, res) => {
  const data = loadData();
  const t = { ...req.body, createdAt: req.body.createdAt || Date.now(), updatedAt: Date.now() };
  if (!t.id) t.id = 'T' + Date.now();
  if (!t.title) return res.status(400).json({ error: 'title required' });
  const idx = data.tickets.findIndex(x => x.id === t.id);
  if (idx >= 0) data.tickets[idx] = t;
  else data.tickets.push(t);
  saveData(data);
  res.json(t);
});

app.put('/api/tickets/:id', (req, res) => {
  const data = loadData();
  const t = { ...req.body, id: req.params.id, updatedAt: Date.now() };
  const idx = data.tickets.findIndex(x => x.id === req.params.id);
  if (idx >= 0) data.tickets[idx] = t;
  else data.tickets.push(t);
  saveData(data);
  res.json(t);
});

app.delete('/api/tickets/:id', (req, res) => {
  const data = loadData();
  data.tickets = data.tickets.filter(x => x.id !== req.params.id);
  saveData(data);
  res.json({ ok: true });
});

// ── EXPORT ──
app.get('/api/export', (req, res) => {
  res.json(loadData());
});

// ── serve frontend ──
app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`YETI x HoBB API running on port ${PORT}`));
