import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import api from '../services/api'

function Triagem() {
  const navigate = useNavigate()

  const [etapaAtual, setEtapaAtual] = useState(1)

  const [form, setForm] = useState({
    nascimento: '',
    sexo: '',
    peso: '',
    altura: '',
    condicoes: [],
    medicamentos: '',
    atividade: ''
  })

  const [erros, setErros] = useState({
    nascimento: false,
    sexo: false,
    peso: false,
    altura: false,
    condicoes: false,
    medicamentos: false,
    atividade: false
  })

  function clearError(field) {
    setErros(prev => ({ ...prev, [field]: false }))
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      if (value === 'nenhuma') {
        setForm(prev => ({
          ...prev,
          condicoes: checked ? ['nenhuma'] : []
        }))
      } else {
        setForm(prev => ({
          ...prev,
          condicoes: checked
            ? [...prev.condicoes.filter(c => c !== 'nenhuma'), value]
            : prev.condicoes.filter(c => c !== value)
        }))
      }
      clearError('condicoes')
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'nascimento') clearError('nascimento')
    if (name === 'sexo') clearError('sexo')
    if (name === 'peso') clearError('peso')
    if (name === 'altura') clearError('altura')
    if (name === 'medicamentos') clearError('medicamentos')
    if (name === 'atividade') clearError('atividade')
  }

  function validateStep1() {
    const novosErros = {
      nascimento: !form.nascimento.trim(),
      sexo: !form.sexo,
      peso: !form.peso || parseFloat(form.peso) < 20 || parseFloat(form.peso) > 300,
      altura: !form.altura || parseFloat(form.altura) < 50 || parseFloat(form.altura) > 250,
      condicoes: form.condicoes.length === 0,
      medicamentos: !form.medicamentos,
      atividade: !form.atividade
    }

    setErros(novosErros)
    return !Object.values(novosErros).some(Boolean)
  }

  function limparErros() {
    setErros({
      nascimento: false,
      sexo: false,
      peso: false,
      altura: false,
      condicoes: false,
      medicamentos: false,
      atividade: false
    })
  }

  async function handleContinuar() {
    if (etapaAtual === 1) {
      if (validateStep1()) {
        setEtapaAtual(2)
        limparErros()
      }
    } else {
      const nivelMap = {
        sedentario: 'Sedentária',
        leve: 'Levemente ativo',
        moderado: 'Moderadamente ativo',
        intenso: 'Muito ativo',
        extremo: 'Extremamente ativo'
      }

      const payload = {
        data_nascimento: form.nascimento,
        sexo: form.sexo,
        peso_kg: parseFloat(form.peso),
        altura_cm: parseFloat(form.altura),
        condicoes: form.condicoes,
        usa_medicamentos: form.medicamentos === 'sim',
        nivel_atividade: nivelMap[form.atividade] || form.atividade
      }

      try {
        await api.post('/triagem', payload)
        navigate('/dashboard')
      } catch (error) {
        if (error.response?.status === 409) {
          alert('Triagem já foi realizada anteriormente.')
          navigate('/dashboard')
        } else {
          alert('Erro ao enviar triagem. Tente novamente.')
        }
      }
    }
  }

  function handleVoltar() {
    if (etapaAtual === 2) {
      setEtapaAtual(1)
    } else {
      navigate('/cadastro')
    }
  }

  return (
    <main className="bg-white flex flex-col w-full max-w-[420px] p-7 rounded-[16px] shadow-login" style={{ animation: 'fadeUp .4s ease both' }}>
      <Header />

      <div className="mb-6">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: etapaAtual === 1 ? '50%' : '100%' }} />
        </div>
        <p className="progress-label">Etapa {etapaAtual} de 2</p>
      </div>

      {etapaAtual === 1 && (
        <>
          <div className="heading">
            <h1 className='text-[22px]'>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="2" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              Triagem de saúde
            </h1>
            <p>Responda com atenção para montarmos seu perfil personalizado.</p>
          </div>

          <form className="form">

            <div className={`field ${erros.nascimento ? 'error' : ''}`}>
              <label htmlFor="nascimento">Data de nascimento</label>
              <input
                type="date"
                id="nascimento"
                name="nascimento"
                value={form.nascimento}
                onChange={handleChange}
              />
              <span className="hint">Por favor, informe sua data de nascimento.</span>
            </div>

            <div className={`field ${erros.sexo ? 'error' : ''}`}>
              <label>Sexo biológico</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" name="sexo" value="masculino" checked={form.sexo === 'masculino'} onChange={handleChange} />
                  <span className="radio-custom" />
                  <span className="radio-label">Masculino</span>
                </label>
                <label className="radio-item">
                  <input type="radio" name="sexo" value="feminino" checked={form.sexo === 'feminino'} onChange={handleChange} />
                  <span className="radio-custom" />
                  <span className="radio-label">Feminino</span>
                </label>
              </div>
              <span className="hint">Selecione uma opção.</span>
            </div>

            <div className="row-2">
              <div className={`field ${erros.peso ? 'error' : ''}`}>
                <label htmlFor="peso">Peso (kg)</label>
                <input
                  type="number"
                  id="peso"
                  name="peso"
                  min="20"
                  max="300"
                  value={form.peso}
                  onChange={handleChange}
                />
                <span className="hint">Informe seu peso.</span>
              </div>
              <div className={`field ${erros.altura ? 'error' : ''}`}>
                <label htmlFor="altura">Altura (cm)</label>
                <input
                  type="number"
                  id="altura"
                  name="altura"
                  min="50"
                  max="250"
                  value={form.altura}
                  onChange={handleChange}
                />
                <span className="hint">Informe sua altura.</span>
              </div>
            </div>

            <div className={`field ${erros.condicoes ? 'error' : ''}`}>
              <label>Você possui alguma condição de saúde diagnosticada?</label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input type="checkbox" name="condicao" value="hipertensao" checked={form.condicoes.includes('hipertensao')} onChange={handleChange} />
                  <span className="checkbox-custom"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" /></svg></span>
                  Hipertensão
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" name="condicao" value="diabetes" checked={form.condicoes.includes('diabetes')} onChange={handleChange} />
                  <span className="checkbox-custom"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" /></svg></span>
                  Diabetes
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" name="condicao" value="obesidade" checked={form.condicoes.includes('obesidade')} onChange={handleChange} />
                  <span className="checkbox-custom"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" /></svg></span>
                  Obesidade
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" name="condicao" value="nenhuma" checked={form.condicoes.includes('nenhuma')} onChange={handleChange} />
                  <span className="checkbox-custom"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" /></svg></span>
                  Nenhuma
                </label>
              </div>
              <span className="hint">Selecione ao menos uma opção.</span>
            </div>

            <div className={`field ${erros.medicamentos ? 'error' : ''}`}>
              <label>Você faz uso regular de medicamentos?</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" name="medicamentos" value="sim" checked={form.medicamentos === 'sim'} onChange={handleChange} />
                  <span className="radio-custom" />
                  <span className="radio-label">Sim</span>
                </label>
                <label className="radio-item">
                  <input type="radio" name="medicamentos" value="nao" checked={form.medicamentos === 'nao'} onChange={handleChange} />
                  <span className="radio-custom" />
                  <span className="radio-label">Não</span>
                </label>
              </div>
              <span className="hint">Selecione uma opção.</span>
            </div>

            <div className={`field ${erros.atividade ? 'error' : ''}`}>
              <label htmlFor="atividade">Nível de atividade física</label>
              <div className="select-wrap">
                <select
                  id="atividade"
                  name="atividade"
                  value={form.atividade}
                  onChange={handleChange}
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="sedentario">Sedentário</option>
                  <option value="leve">Levemente ativo</option>
                  <option value="moderado">Moderadamente ativo</option>
                  <option value="intenso">Muito ativo</option>
                  <option value="extremo">Extremamente ativo</option>
                </select>
              </div>
              <span className="hint">Selecione seu nível de atividade.</span>
            </div>

            <button className="btn-primary" type="button" onClick={handleContinuar}>Continuar</button>
            <button className="btn-back" type="button" onClick={handleVoltar}>Voltar</button>

          </form>
        </>
      )}

      {etapaAtual === 2 && (
        <>
          <div className="heading">
            <h1 className='text-[22px]'>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="2" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              Revisão final
            </h1>
            <p>Confira seus dados antes de finalizar.</p>
          </div>

          <div className="form">
            <button className="btn-primary" type="button" onClick={handleContinuar}>Finalizar</button>
            <button className="btn-back" type="button" onClick={handleVoltar}>Voltar</button>
          </div>
        </>
      )}

    </main>
  )
}

export default Triagem
