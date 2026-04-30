import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

function Triagem() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nascimento: '',
    sexo: '',
    peso: '',
    altura: '',
    condicoes: [],
    medicamentos: '',
    atividade: ''
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      if (value === 'nenhuma') {
        setForm(prev => ({
          ...prev,
          condicoes: checked ? ['nenhuma'] : []
        }))
        return
      }

      setForm(prev => ({
        ...prev,
        condicoes: checked
          ? [...prev.condicoes.filter(c => c !== 'nenhuma'), value]
          : prev.condicoes.filter(c => c !== value)
      }))
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleContinuar() {
    console.log('Dados da triagem:', form)
  }

  function handleVoltar() {
    navigate('/cadastro')
  }

  return (
    <main className="bg-white flex flex-col w-full max-w-[420px] p-7 rounded-[16px] shadow-login" style={{ animation: 'fadeUp .4s ease both' }}>
      <Header />

      <div className="mb-6">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: '50%' }} />
        </div>
        <p className="progress-label">Etapa 1 de 2</p>
      </div>

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

        <div className="field">
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

        <div className="field">
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
          <div className="field">
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
          <div className="field">
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

        <div className="field">
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

        <div className="field">
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

        <div className="field">
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
    </main>
  )
}

export default Triagem
