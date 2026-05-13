const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'contacts.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT,
    telephone TEXT
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/contacts', (req, res) => {
  const contacts = db.prepare('SELECT * FROM contacts ORDER BY nom, prenom').all();
  res.json(contacts);
});

app.post('/contacts', (req, res) => {
  const { nom, prenom, email, telephone } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom obligatoires' });
  const result = db.prepare('INSERT INTO contacts (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)').run(nom, prenom, email || '', telephone || '');
  res.status(201).json({ id: result.lastInsertRowid, nom, prenom, email, telephone });
});

app.put('/contacts/:id', (req, res) => {
  const { nom, prenom, email, telephone } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom obligatoires' });
  const result = db.prepare('UPDATE contacts SET nom=?, prenom=?, email=?, telephone=? WHERE id=?').run(nom, prenom, email || '', telephone || '', req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Contact introuvable' });
  res.json({ id: parseInt(req.params.id), nom, prenom, email, telephone });
});

app.delete('/contacts/:id', (req, res) => {
  const result = db.prepare('DELETE FROM contacts WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Contact introuvable' });
  res.status(204).end();
});

app.get('/export/json', (req, res) => {
  const contacts = db.prepare('SELECT id, nom, prenom, email, telephone FROM contacts ORDER BY nom, prenom').all();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="contacts.json"');
  res.json(contacts);
});

app.get('/export/rdf', (req, res) => {
  const contacts = db.prepare('SELECT * FROM contacts ORDER BY nom, prenom').all();

  const individuals = contacts.map(c => {
    const uri = `urn:contact:${c.id}`;
    const emailTriple = c.email ? `\n    <vcard:hasEmail rdf:resource="mailto:${escapeXml(c.email)}"/>` : '';
    const telTriple = c.telephone ? `\n    <vcard:hasTelephone rdf:resource="tel:${escapeXml(c.telephone)}"/>` : '';
    return `  <vcard:Individual rdf:about="${uri}">
    <vcard:fn>${escapeXml(c.prenom + ' ' + c.nom)}</vcard:fn>
    <vcard:given-name>${escapeXml(c.prenom)}</vcard:given-name>
    <vcard:family-name>${escapeXml(c.nom)}</vcard:family-name>${emailTriple}${telTriple}
  </vcard:Individual>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:vcard="http://www.w3.org/2006/vcard/ns#">
${individuals}
</rdf:RDF>`;

  res.setHeader('Content-Type', 'application/rdf+xml');
  res.setHeader('Content-Disposition', 'attachment; filename="contacts.rdf"');
  res.send(xml);
});

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

app.listen(PORT, () => console.log(`card-classic démarré sur http://localhost:${PORT}`));
