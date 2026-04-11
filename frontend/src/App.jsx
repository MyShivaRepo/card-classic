import { useState } from 'react'
import ContactList from './components/ContactList'
import ContactForm from './components/ContactForm'
import './App.css'

export default function App() {
  // mode: 'list' | 'form'
  const [mode, setMode] = useState('list')
  // null = creation, object = edition
  const [editContact, setEditContact] = useState(null)
  // trigger refresh of list after mutations
  const [refreshKey, setRefreshKey] = useState(0)

  function openForm(contact = null) {
    setEditContact(contact)
    setMode('form')
  }

  function goToList() {
    setMode('list')
    setEditContact(null)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-logo">📇</span>
          <h1 className="app-title">card-classic</h1>
          <span className="app-subtitle">Gestion de contacts</span>
        </div>
      </header>

      <main className="app-main">
        {mode === 'list' ? (
          <ContactList
            key={refreshKey}
            onAdd={() => openForm(null)}
            onEdit={(contact) => openForm(contact)}
          />
        ) : (
          <ContactForm
            contact={editContact}
            onSaved={goToList}
            onCancel={goToList}
          />
        )}
      </main>
    </div>
  )
}
