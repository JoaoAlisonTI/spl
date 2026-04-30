import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

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
    <main className="bg-white flex flex-col w-full max-w-[400px] p-7 rounded-xl shadow-login">
      <Header />

      <h2 className="pb-5 text-xl font-bold">Entrar</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm">
          E-mail
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="bg-bg-custom p-4 rounded-xl border-none font-primary text-sm transition-all focus:bg-white focus:outline-1 focus:outline-primary focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Senha
          <input
            name="senha"
            type="password"
            required
            value={form.senha}
            onChange={handleChange}
            className="bg-bg-custom p-4 rounded-xl border-none font-primary text-sm transition-all focus:bg-white focus:outline-1 focus:outline-primary focus:ring-4 focus:ring-primary/10"
          />
        </label>

        <button
          type="submit"
          disabled={loading || !formularioValido()}
          className="bg-primary text-white text-base font-bold p-4 rounded-xl cursor-pointer font-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {erro && (
        <div className="mt-4 text-sm text-red-500">
          <p>{erro}</p>
        </div>
      )}

      <div className="flex items-center justify-center pt-12 pb-2">
        <p className="text-sm">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="no-underline text-primary font-bold hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Login
