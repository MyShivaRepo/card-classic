import { useState, useEffect, useCallback } from 'react'
import './ContactList.css'

const COLUMNS = [
  { key: 'nom',       label: 'Nom' },
  { key: 'prenom',    label: 'Prénom' },
  { key: 'email',     label: 'E-Mail' },
  { key: 'telephone', label: 'Téléphone' },
]

export default function ContactList({ onAdd, onEdit }) {
  const [contacts, setContacts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [sortCol, setSortCol]       = useState('nom')
  const [sortDir, setSortDir]       = useState('asc')
  const [deleteId, setDeleteId]     = useState(null)   // confirmation modal

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contacts')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setContacts(data)
    } catch (e) {
      setError('Impossible de charger les contacts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  function handleSort(col) {
    if (col === sortCol) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  function sortedContacts() {
    return [...contacts].sort((a, b) => {
      const va = (a[sortCol] || '').toLowerCase()
      const vb = (b[sortCol] || '').toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  async function confirmDelete(id) {
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDeleteId(null)
      fetchContacts()
    } catch {
      setError('Erreur lors de la suppression.')
      setDeleteId(null)
    }
  }

  function handleExportRdf() {
    window.location.href = '/api/export/rdf'
  }

  const sorted = sortedContacts()

  return (
    <div className="contact-list">
      {/* Toolbar */}
      <div className="toolbar">
        <h2 className="toolbar-title">
          Contacts
          {!loading && (
            <span className="contact-count">{contacts.length}</span>
          )}
        </h2>
        <button className="btn btn-green" onClick={onAdd}>
          ＋ Ajouter
        </button>
      </div>

      {/* Error */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="loading">Chargement…</div>
      ) : contacts.length === 0 ? (
        <div className="empty-state">
          <p>Aucun contact enregistré.</p>
          <p>Cliquez sur <strong>Ajouter</strong> pour créer votre premier contact.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="contacts-table">
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={sortCol === col.key ? 'sorted' : ''}
                    title={`Trier par ${col.label}`}
                  >
                    {col.label}
                    <span className="sort-icon">
                      {sortCol === col.key
                        ? sortDir === 'asc' ? ' ▲' : ' ▼'
                        : ' ⇅'}
                    </span>
                  </th>
                ))}
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(contact => (
                <tr key={contact.id}>
                  <td>{contact.nom}</td>
                  <td>{contact.prenom}</td>
                  <td>
                    {contact.email
                      ? <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      : <span className="empty-cell">—</span>}
                  </td>
                  <td>
                    {contact.telephone || <span className="empty-cell">—</span>}
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn btn-green btn-sm"
                      onClick={() => onEdit(contact)}
                      title="Modifier ce contact"
                    >
                      ✏ Modifier
                    </button>
                    <button
                      className="btn btn-red btn-sm"
                      onClick={() => setDeleteId(contact.id)}
                      title="Supprimer ce contact"
                    >
                      🗑 Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export button */}
      <div className="export-bar">
        <button className="btn btn-blue" onClick={handleExportRdf}>
          ⬇ Exporter RDF/OWL
        </button>
      </div>

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer ce contact ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button className="btn btn-grey" onClick={() => setDeleteId(null)}>
                Annuler
              </button>
              <button className="btn btn-red" onClick={() => confirmDelete(deleteId)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
