import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const linhaConfig = {
  diabetica: {
    border: 'border-purple-300',
    iconBg: 'bg-purple-100',
    iconStroke: 'stroke-[#7c3aed]',
    label: 'Linha Diabética',
    desc: 'Acompanhamento para controle de diabetes'
  },
  obesidade: {
    border: 'border-amber-300',
    iconBg: 'bg-amber-100',
    iconStroke: 'stroke-amber-600',
    label: 'Linha Obesidade',
    desc: 'Programa de controle de peso e nutrição'
  },
  hipertensos: {
    border: 'border-red-300',
    iconBg: 'bg-red-100',
    iconStroke: 'stroke-red-700',
    label: 'Linha Hipertensão',
    desc: 'Controle de pressão arterial e acompanhamento'
  },
  ativa: {
    border: 'border-green-300',
    iconBg: 'bg-green-100',
    iconStroke: 'stroke-[#2e7d55]',
    label: 'Linha Ativa',
    desc: 'Programa de manutenção da saúde'
  }
}

const corMap = {
  green: 'bg-green-100 text-[#2e7d55]',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700'
}

function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkedMetas, setCheckedMetas] = useState({})

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get('/usuario/dashboard')
        setData(res.data)
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/triagem')
          return
        }
        setError('Erro ao carregar dashboard.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [navigate])

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } catch (e) { }
    localStorage.removeItem('spl_token')
    navigate('/')
  }

  function handleCheck(idx) {
    setCheckedMetas(prev => {
      const next = { ...prev }
      next[idx] = !prev[idx]
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const { saudacao, perfil_saude, recomendacoes, metas } = data
  const nomeIniciais = saudacao.replace('Olá, ', '').replace('!', '').split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen w-full bg-gray-100 font-['DM_Sans']">
      <nav className="bg-white border-b border-gray-200 px-6 w-full h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5 font-bold text-base text-[#1c2b22]">
          <div className="w-9 h-9 bg-[#2e7d55] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-white fill-none stroke-[2.4] stroke-linecap-round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          SPL
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2e7d55] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {nomeIniciais}
          </div>
          <button onClick={handleLogout} className="p-1.5 text-gray-500 cursor-pointer hover:text-[#1c2b22] transition-colors" title="Sair">
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="max-w-[780px] mx-auto px-5 py-8 pb-16">
        <div className="mb-7">
          <h1 className="font-['DM_Serif_Display'] text-3xl font-normal text-[#1c2b22]">
            {saudacao}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Veja seu resumo de saúde personalizado.</p>
        </div>

        {perfil_saude?.linhas_ativas?.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-1.5 text-[15px] font-semibold text-[#1c2b22] mb-3.5">
              <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-gray-500 fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Suas linhas de cuidado
            </div>
            <div className="flex gap-3.5 flex-wrap">
              {perfil_saude.linhas_ativas.map(linha => {
                const cfg = linhaConfig[linha] || linhaConfig.ativa
                return (
                  <div key={linha} className={`flex-1 min-w-[200px] bg-white border-[1.5px] ${cfg.border} rounded-xl p-3.5 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow`}>
                    <div className={`w-9 h-9 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <svg viewBox="0 0 24 24" className={`w-[18px] h-[18px] fill-none ${cfg.iconStroke} stroke-2 stroke-linecap-round stroke-linejoin-round`}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <div>
                      <strong className="text-[13.5px] font-semibold text-[#1c2b22] block">{cfg.label}</strong>
                      <span className="text-[12px] text-gray-500">{cfg.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white border border-gray-200 rounded-xl p-4.5 shadow-sm">
              <div className="text-[11.5px] font-medium uppercase tracking-[0.04em] text-gray-500 flex items-center gap-1.5 mb-2.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                IMC
              </div>
              <div className="font-['DM_Serif_Display'] text-3xl text-[#1c2b22] leading-[1.1] mb-2">
                {perfil_saude?.imc?.toFixed(1)}
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-red-100 text-red-700">
                {perfil_saude?.classificacao}
              </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4.5 shadow-sm">
              <div className="text-[11.5px] font-medium uppercase tracking-[0.04em] text-gray-500 flex items-center gap-1.5 mb-2.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Nível de atividade
              </div>
              <div className="text-lg font-semibold text-[#1c2b22] font-['DM_Sans']">
                {perfil_saude?.nivel_atividade}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4.5 shadow-sm">
              <div className="text-[11.5px] font-medium uppercase tracking-[0.04em] text-gray-500 flex items-center gap-1.5 mb-2.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Próxima etapa
              </div>
              <div className="text-sm text-gray-500 leading-[1.5]">
                Agende uma consulta para avaliação completa
              </div>
            </div>
          </div>
        </section>

        {recomendacoes?.length > 0 && (
          <section className="mb-8">
            <div className="text-[15px] font-semibold text-[#1c2b22] mb-3.5">Recomendações para você</div>
            <div className="flex flex-col gap-2.5">
              {recomendacoes.map((rec, idx) => {
                const borderClass = rec.linha === 'diabetica' ? 'border-l-purple-500'
                  : rec.linha === 'obesidade' ? 'border-l-amber-500'
                    : rec.linha === 'hipertensos' ? 'border-l-red-500'
                      : 'border-l-green-500'
                const badgeClass = corMap[rec.cor] || 'bg-gray-100 text-gray-600'
                return (
                  <div
                    key={rec.slug}
                    className={`bg-white border border-gray-200 rounded-xl p-4 pl-5 flex items-start justify-between gap-3.5 shadow-sm relative overflow-hidden fade-up border-l-4 ${borderClass}`}
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <div className="flex-1">
                      <strong className="text-sm font-semibold text-[#1c2b22] block mb-1">{rec.titulo}</strong>
                      <p className="text-[13px] text-gray-500 leading-[1.55]">{rec.texto}</p>
                    </div>
                    <div className="flex-shrink-0 self-start">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${badgeClass}`}>
                        {rec.linha === 'diabetica' ? 'Diabética' : rec.linha === 'obesidade' ? 'Obesidade' : rec.linha === 'hipertensos' ? 'Hipertensão' : 'Ativa'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {metas?.length > 0 && (
          <section>
            <div className="bg-white border border-gray-200 rounded-xl p-5.5 shadow-sm">
              <h3 className="text-base font-semibold mb-4">Metas da semana</h3>
              <div className="flex flex-col gap-3">
                {metas.map((meta, idx) => {
                  const isChecked = checkedMetas[idx] || false
                  const spanStyle = isChecked
                    ? { backgroundColor: '#2e7d55', borderColor: '#2e7d55' }
                    : { backgroundColor: '#ffffff', borderColor: '#e5e7eb' }
                  const svgOpacity = isChecked ? 1 : 0
                  const textClass = isChecked ? 'line-through text-gray-500' : ''

                  return (
                    <label key={idx} className="flex items-center gap-3 text-sm text-[#374151] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={() => handleCheck(idx)}
                      />
                      <span
                        className="w-5 h-5 min-w-[20px] border-2 rounded-md flex items-center justify-center transition-all duration-200"
                        style={spanStyle}
                      >
                        <svg viewBox="0 0 12 12" className="w-3 h-3 stroke-white fill-none stroke-[3] stroke-linecap-round stroke-linejoin-round transition-opacity duration-200" style={{ opacity: svgOpacity }}>
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      </span>
                      <span className={`transition-all ${textClass}`}>{meta.titulo} — <span className="text-gray-500">{meta.meta}</span></span>
                    </label>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Dashboard
