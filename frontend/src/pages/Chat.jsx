import { useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import './Chat.css'

const formatDate = (value) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function Chat() {
  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [employeeId, setEmployeeId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId),
    [conversations, selectedId],
  )

  const conversationTitle = (conversation) => {
    if (!conversation) return role === 'employee' ? 'Nuevo chat con administrador' : 'Selecciona una conversación'
    return role === 'admin' ? conversation.employee_username : conversation.admin_username
  }

  const loadConversations = useCallback(async () => {
    const res = await api.get('/chat/conversations/')
    setConversations(res.data)
    setSelectedId((current) => current || res.data[0]?.id || null)
  }, [])

  const loadEmployees = useCallback(async () => {
    if (role !== 'admin') return
    const res = await api.get('/users/')
    setEmployees(res.data.filter((user) => user.role === 'employee' && user.is_active))
  }, [role])

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([])
      return
    }
    const res = await api.get(`/chat/messages/?conversation=${conversationId}`)
    setMessages(res.data)
  }, [])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadConversations()
      } catch {
        setError('No se pudieron cargar las conversaciones.')
      }

      try {
        await loadEmployees()
      } catch {
        setError('No se pudo cargar la lista de empleados.')
      }
    }

    loadInitialData()
  }, [loadConversations, loadEmployees])

  useEffect(() => {
    const refreshMessages = async () => {
      try {
        await loadMessages(selectedId)
      } catch {
        setError('No se pudieron cargar los mensajes.')
      }
    }

    refreshMessages()
    if (!selectedId) return undefined

    const interval = window.setInterval(() => {
      loadMessages(selectedId).catch(() => {})
      loadConversations().catch(() => {})
    }, 10000)
    return () => window.clearInterval(interval)
  }, [loadConversations, loadMessages, selectedId])

  const startConversation = async () => {
    try {
      setLoading(true)
      setError('')
      setStatus('')
      const payload = role === 'admin' ? { employee: employeeId, subject: 'Indicaciones' } : { subject: 'Indicaciones' }
      const res = await api.post('/chat/conversations/', payload)
      await loadConversations()
      setSelectedId(res.data.id)
      setEmployeeId('')
      setStatus('Conversación lista.')
      return res.data
    } catch (err) {
      setError(getChatError(err, 'No se pudo iniciar la conversación.'))
      return null
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!message.trim()) return

    try {
      setLoading(true)
      setError('')
      setStatus('')
      let conversationId = selectedId
      if (!conversationId && role === 'admin' && employeeId) {
        const conversation = await startConversation()
        conversationId = conversation?.id
      }
      if (!conversationId && role === 'employee') {
        const conversation = await api.post('/chat/conversations/', { subject: 'Indicaciones' })
        conversationId = conversation.data.id
        setSelectedId(conversationId)
      }
      if (!conversationId) {
        setError('Selecciona o crea una conversación antes de enviar.')
        return
      }
      await api.post('/chat/messages/', { conversation: conversationId, body: message })
      setMessage('')
      await loadMessages(conversationId)
      await loadConversations()
    } catch (err) {
      setError(getChatError(err, 'No se pudo enviar el mensaje.'))
    } finally {
      setLoading(false)
    }
  }

  if (role === 'client') {
    return (
      <>
        <Navbar />
        <main className="chat-page">
          <p className="chat-status is-error">El chat está disponible solo para administradores y empleados.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="chat-page">
        <header className="chat-header">
          <div>
            <h1 className="chat-title">Chat interno</h1>
            <p className="chat-subtitle">Comunicación directa entre administrador y empleados para indicaciones de trabajo.</p>
          </div>
        </header>

        {status && <p className="chat-status">{status}</p>}
        {error && <p className="chat-status is-error">{error}</p>}

        <section className="chat-layout">
          <aside className="chat-card chat-sidebar">
            <div className="chat-sidebar-head">
              <h2 className="chat-sidebar-title">Conversaciones</h2>
              {role === 'admin' ? (
                <div className="chat-start">
                  <select className="chat-select" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
                    <option value="">Seleccionar empleado</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.username}</option>
                    ))}
                  </select>
                  <button className="chat-button" onClick={startConversation} disabled={loading || !employeeId}>Abrir</button>
                </div>
              ) : (
                <button className="chat-button" onClick={startConversation} disabled={loading}>
                  Chat con admin
                </button>
              )}
            </div>

            <div className="chat-conversations">
              {conversations.length === 0 ? (
                <p className="chat-empty">Todavía no hay conversaciones.</p>
              ) : conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`chat-conversation ${conversation.id === selectedId ? 'is-active' : ''}`}
                  onClick={() => setSelectedId(conversation.id)}
                >
                  <span className="chat-conversation-top">
                    <span className="chat-name">{conversationTitle(conversation)}</span>
                    {conversation.unread_count > 0 && <span className="chat-badge">{conversation.unread_count}</span>}
                  </span>
                  <p className="chat-preview">{conversation.last_message || conversation.subject || 'Indicaciones'}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="chat-card chat-panel">
            <div className="chat-panel-head">
              <h2 className="chat-panel-title">{conversationTitle(selectedConversation)}</h2>
              <p className="chat-panel-meta">
                {selectedConversation
                  ? 'Indicaciones y seguimiento interno'
                  : role === 'employee'
                    ? 'Escribe tu primer mensaje y se abrirá la conversación automáticamente.'
                    : 'Selecciona un empleado para abrir una conversación.'}
              </p>
            </div>

            <div className="chat-messages">
              {!selectedConversation ? (
                <p className="chat-empty">
                  {role === 'employee'
                    ? 'Aún no tienes conversación. Puedes escribir abajo para iniciar el chat con administración.'
                    : 'Selecciona una conversación para ver los mensajes.'}
                </p>
              ) : messages.length === 0 ? (
                <p className="chat-empty">Aún no hay mensajes. Escribe la primera indicación.</p>
              ) : messages.map((item) => (
                <article key={item.id} className={`chat-message ${item.sender_username === username ? 'is-mine' : ''}`}>
                  <span className="chat-message-author">{item.sender_username}</span>
                  <p className="chat-message-body">{item.body}</p>
                  <span className="chat-message-date">{formatDate(item.created_at)}</span>
                </article>
              ))}
            </div>

            <form className="chat-composer" onSubmit={sendMessage}>
              <textarea
                className="chat-textarea"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escribe una indicación..."
                disabled={!selectedConversation && role !== 'employee' && !employeeId}
              />
              <button className="chat-button" disabled={loading || (!selectedConversation && role !== 'employee' && !employeeId) || !message.trim()}>
                Enviar
              </button>
            </form>
          </section>
        </section>
      </main>
    </>
  )
}

const getChatError = (err, fallback) => {
  if (err.response?.status === 404) {
    return 'El backend desplegado todavía no tiene activo el módulo de chat. Haz redeploy del backend en Render.'
  }
  return err.response?.data?.employee?.[0]
    || err.response?.data?.body?.[0]
    || err.response?.data?.detail
    || fallback
}
