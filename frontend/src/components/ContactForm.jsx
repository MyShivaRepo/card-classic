import { useState } from 'react'
import './ContactForm.css'

const EMPTY = { nom: '', prenom: '', email: '', telephone: '' }

export default function ContactForm({ contact, onSaved, onCancel }) {
  const isEdit = contact !== null
  const [form, setForm] = useState(contact ? { ...contact } : { ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)

  function validate() {
    const e = {}
    if (!form.nom.trim())    e.nom    = 'Le nom est obligatoire.'
    if (!form.prenom.trim()) e.prenom = 'Le prénom est obligatoire.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Format d'e-mail invalide."
    }
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    setApiError(null)
    try {
      const url    = isEdit ? `/api/contacts/${contact.id}` : '/api/contacts'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onSaved()
    } catch {
      setApiError("Une erreur s'est produite lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="contact-form-page">
      <div className="form-card">
        <div className="form-header">
          <button className="back-btn" onClick={onCancel} title="Retour à la liste">
            ← Retour
          </button>
          <h2>{isEdit ? 'Modifier le contact' : 'Nouveau contact'}</h2>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className={`form-group ${errors.nom ? 'has-error' : ''}`}>
              <label htmlFor="nom">Nom <span className="required">*</span></label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={form.nom}
                onChange={handleChange}
                placeholder="Dupont"
                autoFocus
              />
              {errors.nom && <span className="field-error">{errors.nom}</span>}
            </div>

            <div className={`form-group ${errors.prenom ? 'has-error' : ''}`}>
              <label htmlFor="prenom">Prénom <span className="required">*</span></label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={form.prenom}
                onChange={handleChange}
                placeholder="Jean"
              />
              {errors.prenom && <span className="field-error">{errors.prenom}</span>}
            </div>

            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">E-Mail</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jean.dupont@exemple.fr"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                value={form.telephone}
                onChange={handleChange}
                placeholder="+33 6 00 00 00 00"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-grey"
              onClick={onCancel}
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-blue"
              disabled={saving}
            >
              {saving ? 'Enregistrement…' : '✔ Valider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
