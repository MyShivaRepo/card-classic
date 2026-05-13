let contacts = [];
let sortCol = null;
let sortDir = 'asc';

async function chargerContacts() {
  const res = await fetch('/contacts');
  contacts = await res.json();
  afficherListe();
}

function afficherListe() {
  const tbody = document.getElementById('tbody-contacts');
  let data = [...contacts];

  if (sortCol) {
    data.sort((a, b) => {
      const va = (a[sortCol] || '').toLowerCase();
      const vb = (b[sortCol] || '').toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  if (data.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Aucun contact enregistré</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr>
      <td>${esc(c.nom)}</td>
      <td>${esc(c.prenom)}</td>
      <td>${esc(c.email)}</td>
      <td>${esc(c.telephone)}</td>
      <td class="actions">
        <button class="btn btn-green" onclick="ouvrirFiche(${c.id})">Modifier</button>
        <button class="btn btn-red" onclick="supprimerContact(${c.id})">Supprimer</button>
      </td>
    </tr>
  `).join('');
}

function ouvrirFiche(id) {
  const c = id ? contacts.find(x => x.id === id) : null;
  document.getElementById('fiche-titre').textContent = c ? 'Modifier le contact' : 'Nouveau contact';
  document.getElementById('fiche-id').value = c ? c.id : '';
  document.getElementById('fiche-nom').value = c ? c.nom : '';
  document.getElementById('fiche-prenom').value = c ? c.prenom : '';
  document.getElementById('fiche-email').value = c ? c.email : '';
  document.getElementById('fiche-telephone').value = c ? c.telephone : '';
  afficherVue('fiche');
}

function afficherVue(vue) {
  document.getElementById('vue-liste').classList.toggle('hidden', vue !== 'liste');
  document.getElementById('vue-fiche').classList.toggle('hidden', vue !== 'fiche');
}

async function supprimerContact(id) {
  if (!confirm('Supprimer ce contact ?')) return;
  await fetch(`/contacts/${id}`, { method: 'DELETE' });
  await chargerContacts();
}

document.getElementById('form-contact').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('fiche-id').value;
  const payload = {
    nom: document.getElementById('fiche-nom').value.trim(),
    prenom: document.getElementById('fiche-prenom').value.trim(),
    email: document.getElementById('fiche-email').value.trim(),
    telephone: document.getElementById('fiche-telephone').value.trim(),
  };
  const url = id ? `/contacts/${id}` : '/contacts';
  const method = id ? 'PUT' : 'POST';
  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  await chargerContacts();
  afficherVue('liste');
});

document.getElementById('btn-ajouter').addEventListener('click', () => ouvrirFiche(null));
document.getElementById('btn-annuler').addEventListener('click', () => afficherVue('liste'));

document.getElementById('btn-export').addEventListener('click', () => {
  window.location.href = '/export/rdf';
});

document.getElementById('btn-export-json').addEventListener('click', () => {
  window.location.href = '/export/json';
});

document.querySelectorAll('th[data-col]').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col;
    if (sortCol === col) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortCol = col;
      sortDir = 'asc';
    }
    document.querySelectorAll('th[data-col]').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
    th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    afficherListe();
  });
});

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

chargerContacts();
