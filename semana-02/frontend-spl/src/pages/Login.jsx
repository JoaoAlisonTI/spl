import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import '../styles/login.css'

function Login() {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErro('')
  }

  function formularioValido() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    const senhaOk = form.senha.length >= 8
    return emailOk && senhaOk
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formularioValido()) return

    setLoading(true)
    setErro('')

    try {
      const resposta = await api.post('/auth/login', {
        email: form.email,
        senha: form.senha
      })

      localStorage.setItem('spl_token', resposta.data.token)

      if (resposta.data.triagem_concluida) {
        navigate('/dashboard')
      } else {
        navigate('/triagem')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErro(err.response.data.erro)
      } else if (err.response) {
        setErro('Erro ao fazer login. Tente novamente.')
      } else {
        setErro('Não foi possível conectar ao servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="main-login">
      <Header />

      <h2>Entrar</h2>

      <form onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Senha
          <input
            name="senha"
            type="password"
            required
            value={form.senha}
            onChange={handleChange}
          />
        </label>

        <button
          type="submit"
          disabled={loading || !formularioValido()}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {erro && (
        <div className="div-error">
          <p>{erro}</p>
        </div>
      )}

      <div className="div-footer">
        <p>
          Não tem uma conta?{' '}
          <a href="/cadastro">Criar conta</a>
        </p>
      </div>
    </main>
  )
}

export default Login
