import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import '../styles/cadastro.css'

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

  return (
    <main className="main-cadastro">
      <Header />

      <h2>Criar sua conta</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Nome completo
          <input
            name="nome"
            type="text"
            placeholder="Fulano de tal..."
            required
            value={form.nome}
            onChange={handleChange}
            className={erros.nome ? 'input-error' : ''}
          />
          {erros.nome && <small>{erros.nome}</small>}
        </label>

        <label>
          CPF
          <input
            name="cpf"
            type="text"
            placeholder="000.000.000-00"
            required
            value={form.cpf}
            onChange={handleChange}
            className={erros.cpf ? 'input-error' : ''}
          />
          {erros.cpf && <small>{erros.cpf}</small>}
        </label>

        <label>
          Telefone
          <input
            name="telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            required
            value={form.telefone}
            onChange={handleChange}
            className={erros.telefone ? 'input-error' : ''}
          />
          {erros.telefone && <small>{erros.telefone}</small>}
        </label>

        <label>
          E-mail
          <input
            name="email"
            type="email"
            placeholder="example@gmail.com"
            required
            value={form.email}
            onChange={handleChange}
            className={erros.email ? 'input-error' : ''}
          />
          {erros.email && <small>{erros.email}</small>}
        </label>

        <label>
          Senha
          <input
            name="senha"
            type="password"
            placeholder="Mínimo 8 dígitos"
            required
            value={form.senha}
            onChange={handleChange}
            className={erros.senha ? 'input-error' : ''}
          />
          {erros.senha && <small>{erros.senha}</small>}
        </label>

        <label>
          Confirmar senha
          <input
            name="confirmarSenha"
            type="password"
            placeholder="Mínimo 8 dígitos"
            required
            value={form.confirmarSenha}
            onChange={handleChange}
            className={erros.confirmarSenha ? 'input-error' : ''}
          />
          {erros.confirmarSenha && <small>{erros.confirmarSenha}</small>}
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      {apiErro && (
        <div className="div-error">
          <p>{apiErro}</p>
        </div>
      )}

      <div className="div-footer">
        <p>
          Já tem uma conta?{' '}
          <a href="/">Fazer login</a>
        </p>
      </div>
    </main>
  )
}

export default Cadastro
