import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

function validarCPF(cpf) {
  return cpf.replace(/\D/g, '').length === 11
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function Cadastro() {
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })
  const [erros, setErros] = useState({})
  const [apiErro, setApiErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErros(prev => ({ ...prev, [name]: '' }))
    setApiErro('')
  }

  function validar() {
    const novosErros = {}

    if (!form.nome.trim())
      novosErros.nome = 'Nome é obrigatório.'

    if (!validarCPF(form.cpf))
      novosErros.cpf = 'CPF deve ter 11 dígitos.'

    if (!form.telefone.trim())
      novosErros.telefone = 'Telefone é obrigatório.'

    if (!validarEmail(form.email))
      novosErros.email = 'E-mail inválido.'

    if (form.senha.length < 8)
      novosErros.senha = 'A senha deve ter pelo menos 8 caracteres.'

    if (form.senha !== form.confirmarSenha)
      novosErros.confirmarSenha = 'As senhas não coincidem.'

    return novosErros
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const novosErros = validar()
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setLoading(true)
    setApiErro('')

    try {
      const resposta = await api.post('/auth/cadastro', {
        nome: form.nome,
        cpf: form.cpf,
        telefone: form.telefone,
        email: form.email,
        senha: form.senha
      })

      localStorage.setItem('spl_token', resposta.data.token)

      navigate('/triagem')
    } catch (err) {
      if (err.response) {
        if (err.response.data.campos) {
          setErros(err.response.data.campos)
        }
        setApiErro(err.response.data.erro || 'Erro ao criar conta. Tente novamente.')
      } else {
        setApiErro('Não foi possível conectar ao servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = (isError) =>
    `p-4 rounded-xl font-primary text-sm transition-all focus:bg-white ${
      isError
        ? 'bg-red-50 outline outline-1 outline-red-500 ring-4 ring-red-500/20 text-red-900 placeholder-red-400 border-none'
        : 'bg-bg-custom border-none focus:outline-1 focus:outline-primary focus:ring-4 focus:ring-primary/10'
    }`

  return (
    <main className="bg-white flex flex-col w-full max-w-[400px] p-7 rounded-xl shadow-login">
      <Header />

      <h2 className="pb-5 text-xl font-bold">Criar sua conta</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          Nome completo
          <input
            name="nome"
            type="text"
            placeholder="Fulano de tal..."
            required
            value={form.nome}
            onChange={handleChange}
            className={inputClasses(erros.nome)}
          />
          {erros.nome && <small className="text-red-500 text-xs mt-1">{erros.nome}</small>}
        </label>

        <label className="flex flex-col gap-2 text-sm">
          CPF
          <input
            name="cpf"
            type="text"
            placeholder="000.000.000-00"
            required
            value={form.cpf}
            onChange={handleChange}
            className={inputClasses(erros.cpf)}
          />
          {erros.cpf && <small className="text-red-500 text-xs mt-1">{erros.cpf}</small>}
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Telefone
          <input
            name="telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            required
            value={form.telefone}
            onChange={handleChange}
            className={inputClasses(erros.telefone)}
          />
          {erros.telefone && <small className="text-red-500 text-xs mt-1">{erros.telefone}</small>}
        </label>

        <label className="flex flex-col gap-2 text-sm">
          E-mail
          <input
            name="email"
            type="email"
            placeholder="example@gmail.com"
            required
            value={form.email}
            onChange={handleChange}
            className={inputClasses(erros.email)}
          />
          {erros.email && <small className="text-red-500 text-xs mt-1">{erros.email}</small>}
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Senha
          <input
            name="senha"
            type="password"
            placeholder="Mínimo 8 dígitos"
            required
            value={form.senha}
            onChange={handleChange}
            className={inputClasses(erros.senha)}
          />
          {erros.senha && <small className="text-red-500 text-xs mt-1">{erros.senha}</small>}
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Confirmar senha
          <input
            name="confirmarSenha"
            type="password"
            placeholder="Mínimo 8 dígitos"
            required
            value={form.confirmarSenha}
            onChange={handleChange}
            className={inputClasses(erros.confirmarSenha)}
          />
          {erros.confirmarSenha && <small className="text-red-500 text-xs mt-1">{erros.confirmarSenha}</small>}
        </label>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary text-white text-base font-bold p-4 rounded-xl cursor-pointer font-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      {apiErro && (
        <div className="mt-4 text-sm text-red-500 text-center">
          <p>{apiErro}</p>
        </div>
      )}

      <div className="flex items-center justify-center pt-8 pb-2">
        <p className="text-sm">
          Já tem uma conta?{' '}
          <Link to="/" className="no-underline text-primary font-bold hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Cadastro
