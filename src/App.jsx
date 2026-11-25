import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import {
  Church,
  Calendar,
  BookOpen,
  CheckCircle2,
  Heart,
  Clock,
  User,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Users,
  ExternalLink,
  Megaphone,
  MessageCircle,
  Globe,
  Share2
} from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [activeTab, setActiveTab] = useState('hoje')

  const [versiculos, setVersiculos] = useState([])
  const [agenda, setAgenda] = useState([])
  const [avisos, setAvisos] = useState([])
  const [presencas, setPresencas] = useState([])
  const [reflexaoTexto, setReflexaoTexto] = useState('')
  const [salvandoReflexao, setSalvandoReflexao] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  const [inscricoesCat, setInscricoesCat] = useState([])
  const [nomeCatequizando, setNomeCatequizando] = useState('')
  const [idadeCatequizando, setIdadeCatequizando] = useState('')
  const [etapaCatequese, setEtapaCatequese] = useState('Eucaristia (Infantil)')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [whatsappCat, setWhatsappCat] = useState('')
  const [obsCat, setObsCat] = useState('')
  const [enviandoCat, setEnviandoCat] = useState(false)
  const [sucessoCat, setSucessoCat] = useState('')

  const [mesAtual, setMesAtual] = useState(new Date())

  const getHojeLocal = () => {
    const d = new Date()
    const ano = d.getFullYear()
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  const hojeStr = getHojeLocal()
  const presencaHoje = presencas.find((p) => p.data_presenca === hojeStr)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null)
      setLoadingAuth(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => listener?.subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      carregarDados()
    }
  }, [session])

  useEffect(() => {
    setReflexaoTexto(presencaHoje?.reflexao || '')
  }, [presencaHoje])

  async function carregarDados() {
    const { data: versData } = await supabase.from('versiculos').select('*')
    if (versData) setVersiculos(versData)

    const { data: agendaData } = await supabase
      .from('agenda_igreja')
      .select('*')
      .order('ordem', { ascending: true })
    if (agendaData) setAgenda(agendaData)

    const { data: avisosData } = await supabase
      .from('avisos_paroquia')
      .select('*')
      .eq('ativo', true)
    if (avisosData) setAvisos(avisosData)

    const { data: presData } = await supabase
      .from('presencas')
      .select('*')
      .order('data_presenca', { ascending: false })
    if (presData) setPresencas(presData)

    const { data: catData } = await supabase
      .from('inscricoes_catequese')
      .select('*')
      .order('criado_em', { ascending: false })
    if (catData) setInscricoesCat(catData)
  }

  async function handleAuth(e) {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome } }
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
      }
    } catch (err) {
      setAuthError(
        err.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : err.message
      )
    } finally {
      setAuthLoading(false)
    }
  }

  async function togglePresencaHoje() {
    if (!session) return

    if (presencaHoje) {
      if (
        presencaHoje.reflexao &&
        !window.confirm('Deseja desmarcar sua presença de hoje? Sua reflexão de hoje será apagada.')
      ) {
        return
      }
      await supabase.from('presencas').delete().eq('id', presencaHoje.id)
      setPresencas(presencas.filter((p) => p.id !== presencaHoje.id))
      setReflexaoTexto('')
    } else {
      const { data, error } = await supabase
        .from('presencas')
        .insert({
          user_id: session.user.id,
          data_presenca: hojeStr,
          reflexao: ''
        })
        .select()
        .single()

      if (!error && data) {
        setPresencas([data, ...presencas])
      }
    }
  }

  async function salvarReflexao(e) {
    e.preventDefault()
    if (!presencaHoje) return
    setSalvandoReflexao(true)
    setFeedbackMsg('')

    const { data, error } = await supabase
      .from('presencas')
      .update({ reflexao: reflexaoTexto })
      .eq('id', presencaHoje.id)
      .select()
      .single()

    setSalvandoReflexao(false)
    if (!error && data) {
      setPresencas(presencas.map((p) => (p.id === data.id ? data : p)))
      setFeedbackMsg('Reflexão guardada no seu diário!')
      setTimeout(() => setFeedbackMsg(''), 3000)
    }
  }

  async function enviarInscricaoCatequese(e) {
    e.preventDefault()
    if (!session) return
    setEnviandoCat(true)
    setSucessoCat('')

    const { data, error } = await supabase
      .from('inscricoes_catequese')
      .insert({
        user_id: session.user.id,
        nome_catequizando: nomeCatequizando,
        idade: Number(idadeCatequizando),
        etapa: etapaCatequese,
        nome_responsavel: nomeResponsavel,
        whatsapp: whatsappCat,
        observacao: obsCat
      })
      .select()
      .single()

    setEnviandoCat(false)
    if (!error && data) {
      setInscricoesCat([data, ...inscricoesCat])
      setNomeCatequizando('')
      setIdadeCatequizando('')
      setNomeResponsavel('')
      setWhatsappCat('')
      setObsCat('')
      setSucessoCat('Pré-cadastro enviado! A coordenação da paróquia entrará em contato.')
      setTimeout(() => setSucessoCat(''), 5000)
    }
  }

  const calcularEstatisticas = () => {
    const hoje = new Date()
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    const mesAtualNum = hoje.getMonth()
    const anoAtualNum = hoje.getFullYear()

    let naSemana = 0
    let noMes = 0

    presencas.forEach((p) => {
      const [ano, mes, dia] = p.data_presenca.split('-').map(Number)
      const dataP = new Date(ano, mes - 1, dia)

      if (dataP >= inicioSemana) naSemana++
      if (mes - 1 === mesAtualNum && ano === anoAtualNum) noMes++
    })

    return { naSemana, noMes }
  }

  const gerarDiasCalendario = () => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()

    const dias = []
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null)
    }
    for (let d = 1; d <= totalDias; d++) {
      const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const foi = presencas.some((p) => p.data_presenca === dataFormatada)
      dias.push({ dia: d, dataFormatada, foi })
    }
    return dias
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="animate-pulse flex flex-col items-center gap-3 text-[#8C6D53]">
          <Church className="w-10 h-10" />
          <p className="text-sm font-medium">Preparando seu espaço...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-[#FAF7F2]">
        <div className="max-w-sm w-full mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white border border-[#EAE2D6] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm overflow-hidden p-1.5">
              <img
                src="/logo-bom-pastor.jpg"
                alt="Logo Paróquia Bom Pastor"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="font-serif-verse text-2xl font-semibold text-[#2C2A29]">
              Paróquia Bom Pastor
            </h1>
            <p className="text-sm text-[#6E675F] mt-1">
              Seu espaço diário de fé, presença e reflexão
            </p>
          </div>

          <form
            onSubmit={handleAuth}
            className="bg-white p-6 rounded-3xl border border-[#EAE2D6] shadow-sm space-y-4"
          >
            <h2 className="text-lg font-semibold text-[#2C2A29]">
              {isSignUp ? 'Criar sua conta' : 'Entrar no aplicativo'}
            </h2>

            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-[#6E675F] mb-1">
                  Seu nome
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como gostaria de ser chamado?"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#6E675F] mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6E675F] mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-[#8C6D53] hover:bg-[#775B44] text-white font-medium text-sm transition shadow-sm disabled:opacity-50"
            >
              {authLoading ? 'Aguarde...' : isSignUp ? 'Cadastrar e Entrar' : 'Entrar'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setAuthError('')
                }}
                className="text-xs text-[#8C6D53] font-medium hover:underline"
              >
                {isSignUp ? 'Já tem conta? Faça login' : 'Primeira vez aqui? Crie sua conta grátis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const { naSemana, noMes } = calcularEstatisticas()
  const nomeUsuario = session.user.user_metadata?.nome || session.user.email.split('@')[0]

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 max-w-md mx-auto relative shadow-xs">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE2D6] flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-xs">
            <img
              src="/logo-bom-pastor.jpg"
              alt="Logo Bom Pastor"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="text-xs text-[#8C6D53] font-medium uppercase tracking-wider">
              Paróquia Bom Pastor
            </p>
            <h1 className="text-xl font-semibold text-[#2C2A29] capitalize">
              Paz e bem, {nomeUsuario}
            </h1>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          title="Sair da conta"
          className="p-2.5 rounded-full bg-white border border-[#EAE2D6] text-[#6E675F] hover:text-[#8C6D53] transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {activeTab === 'hoje' && (
        <main className="px-6 space-y-6">
          {avisos.length > 0 && (
            <section className="bg-[#F3ECE1] p-4 rounded-2xl border border-[#E2D4C0] flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#8C6D53]/15 text-[#8C6D53] shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#8C6D53]">
                  {avisos[0].titulo}
                </h3>
                <p className="text-xs text-[#4A453E] mt-1 leading-relaxed">
                  {avisos[0].descricao}
                </p>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#2C2A29] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
                Palavra do Dia
              </h2>
              <span className="text-[11px] text-[#8E867E]">Deslize →</span>
            </div>

            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1">
              {versiculos.map((v) => (
                <div
                  key={v.id}
                  className="snap-center shrink-0 w-[85%] bg-gradient-to-br from-[#8C6D53] to-[#6E533D] text-white p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[150px]"
                >
                  <p className="font-serif-verse italic text-base leading-relaxed text-[#FAF7F2]">
                    “{v.texto}”
                  </p>
                  <p className="text-xs font-medium text-[#E6CCB2] mt-4">
                    — {v.referencia}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6]">
              <p className="text-xs text-[#6E675F]">Esta semana</p>
              <p className="text-2xl font-bold text-[#8C6D53] mt-1">
                {naSemana}{' '}
                <span className="text-xs font-normal text-[#6E675F]">
                  {naSemana === 1 ? 'dia' : 'dias'}
                </span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6]">
              <p className="text-xs text-[#6E675F]">Neste mês</p>
              <p className="text-2xl font-bold text-[#5C6F68] mt-1">
                {noMes}{' '}
                <span className="text-xs font-normal text-[#6E675F]">
                  {noMes === 1 ? 'dia' : 'dias'}
                </span>
              </p>
            </div>
          </section>

          <section className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-xs">
            <div>
              <h3 className="font-semibold text-[#2C2A29]">Presença na Igreja</h3>
              <p className="text-xs text-[#6E675F] mt-1">
                {presencaHoje
                  ? 'Que bênção! Você já registrou sua ida hoje.'
                  : 'Participou da celebração hoje? Marque sua presença.'}
              </p>
            </div>

            <button
              onClick={togglePresencaHoje}
              className={`mt-4 w-full py-3.5 px-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition ${
                presencaHoje
                  ? 'bg-[#5C6F68] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#8C6D53] border border-[#D4A373] hover:bg-[#8C6D53] hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              {presencaHoje ? 'Fui à igreja hoje ✓' : 'Marcar que fui à igreja hoje'}
            </button>

            {presencaHoje && (
              <form
                onSubmit={salvarReflexao}
                className="mt-5 pt-5 border-t border-[#EAE2D6] space-y-3"
              >
                <label className="text-sm font-medium text-[#2C2A29] flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#D4A373]" />
                  Reflexão após a celebração
                </label>
                <p className="text-xs text-[#6E675F]">
                  Qual mensagem, leitura ou sentimento ficou no seu coração ao final?
                </p>
                <textarea
                  rows={4}
                  value={reflexaoTexto}
                  onChange={(e) => setReflexaoTexto(e.target.value)}
                  placeholder="Escreva aqui sua reflexão de hoje..."
                  className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm text-[#2C2A29] focus:outline-none focus:border-[#8C6D53] resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#5C6F68] font-medium">
                    {feedbackMsg}
                  </span>
                  <button
                    type="submit"
                    disabled={salvandoReflexao}
                    className="px-5 py-2.5 rounded-xl bg-[#8C6D53] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-[#775B44] transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {salvandoReflexao ? 'Salvando...' : 'Salvar reflexão'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </main>
      )}

      {activeTab === 'agenda' && (
        <main className="px-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#2C2A29]">Dias e Horários</h2>
            <p className="text-xs text-[#6E675F]">
              Confira as celebrações da semana e quem irá presidir
            </p>
          </div>

          <div className="space-y-3">
            {agenda.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE2D6] text-xs font-semibold text-[#8C6D53]">
                    {item.dia_semana}
                  </span>
                  <span className="text-sm font-bold text-[#2C2A29] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                    {item.horario}
                  </span>
                </div>

                {item.observacao && (
                  <p className="text-sm font-medium text-[#2C2A29]">
                    {item.observacao}
                  </p>
                )}

                <div className="pt-2 border-t border-[#FAF7F2] flex items-center gap-2 text-xs text-[#6E675F]">
                  <User className="w-3.5 h-3.5 text-[#5C6F68]" />
                  <span>
                    Celebrante: <strong className="text-[#2C2A29]">{item.celebrante}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'paroquia' && (
        <main className="px-6 space-y-6">
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-[#2C2A29]">Canais da Paróquia</h2>
              <p className="text-xs text-[#6E675F]">
                Acompanhe avisos, fotos e transmissões da Bom Pastor
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <a
                href="https://whatsapp.com/channel/0029VbDmzh38F2pLJg9SDZ10"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3.5 rounded-2xl border border-[#EAE2D6] flex items-center justify-between hover:border-[#5C6F68] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5C6F68]/10 text-[#5C6F68] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2C2A29]">Canal no WhatsApp</p>
                    <p className="text-[11px] text-[#6E675F]">Avisos rápidos e comunicados oficiais</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#8E867E]" />
              </a>

              <a
                href="https://www.instagram.com/bom_pastor_paroquia_guaianazes/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3.5 rounded-2xl border border-[#EAE2D6] flex items-center justify-between hover:border-[#8C6D53] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/15 text-[#8C6D53] flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2C2A29]">Instagram Oficial</p>
                    <p className="text-[11px] text-[#6E675F]">@bom_pastor_paroquia_guaianazes</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#8E867E]" />
              </a>

              <a
                href="https://www.facebook.com/paroquiabompastorjardimcentenario/?locale=pt_BR"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3.5 rounded-2xl border border-[#EAE2D6] flex items-center justify-between hover:border-[#8C6D53] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8C6D53]/10 text-[#8C6D53] flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2C2A29]">Facebook da Comunidade</p>
                    <p className="text-[11px] text-[#6E675F]">Paróquia Bom Pastor • Jd. Centenário</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#8E867E]" />
              </a>
            </div>
          </section>

          <section className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#2C2A29] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8C6D53]" />
                Pré-cadastro na Catequese
              </h3>
              <p className="text-xs text-[#6E675F] mt-1">
                Preencha os dados abaixo para demonstrar interesse nas próximas turmas de catequese.
              </p>
            </div>

            <form onSubmit={enviarInscricaoCatequese} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#6E675F] mb-1">
                  Nome completo do catequizando
                </label>
                <input
                  type="text"
                  required
                  value={nomeCatequizando}
                  onChange={(e) => setNomeCatequizando(e.target.value)}
                  placeholder="Ex: João Pedro Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-[#6E675F] mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={99}
                    value={idadeCatequizando}
                    onChange={(e) => setIdadeCatequizando(e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6E675F] mb-1">
                    Etapa / Turma
                  </label>
                  <select
                    value={etapaCatequese}
                    onChange={(e) => setEtapaCatequese(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
                  >
                    <option value="Eucaristia (Infantil)">Eucaristia (Infantil)</option>
                    <option value="Perseverança">Perseverança</option>
                    <option value="Crisma (Jovens)">Crisma (Jovens)</option>
                    <option value="Catequese de Adultos">Catequese de Adultos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E675F] mb-1">
                  Nome do responsável (se menor de idade)
                </label>
                <input
                  type="text"
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  placeholder="Nome da mãe, pai ou responsável"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E675F] mb-1">
                  WhatsApp para contato
                </label>
                <input
                  type="tel"
                  required
                  value={whatsappCat}
                  onChange={(e) => setWhatsappCat(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E675F] mb-1">
                  Observação ou preferência de horário (opcional)
                </label>
                <input
                  type="text"
                  value={obsCat}
                  onChange={(e) => setObsCat(e.target.value)}
                  placeholder="Ex: Sábado pela manhã"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-sm focus:outline-none focus:border-[#8C6D53]"
                />
              </div>

              {sucessoCat && (
                <p className="text-xs text-[#5C6F68] bg-[#5C6F68]/10 p-3 rounded-xl font-medium">
                  {sucessoCat}
                </p>
              )}

              <button
                type="submit"
                disabled={enviandoCat}
                className="w-full py-3 rounded-xl bg-[#8C6D53] hover:bg-[#775B44] text-white font-medium text-sm transition shadow-xs disabled:opacity-50"
              >
                {enviandoCat ? 'Enviando...' : 'Enviar pré-cadastro'}
              </button>
            </form>

            {inscricoesCat.length > 0 && (
              <div className="pt-4 border-t border-[#EAE2D6] space-y-2">
                <p className="text-xs font-semibold text-[#2C2A29]">
                  Seus pré-cadastros enviados:
                </p>
                {inscricoesCat.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#2C2A29]">
                        {ins.nome_catequizando} ({ins.idade} anos)
                      </p>
                      <p className="text-[#6E675F]">{ins.etapa}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#5C6F68]/15 text-[#5C6F68] font-medium text-[11px]">
                      Enviado ✓
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {activeTab === 'caminhada' && (
        <main className="px-6 space-y-6">
          <section className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() =>
                  setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))
                }
                className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#6E675F]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-sm capitalize text-[#2C2A29]">
                {mesAtual.toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <button
                onClick={() =>
                  setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))
                }
                className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#6E675F]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-[#8E867E] mb-2">
              <span>D</span>
              <span>S</span>
              <span>T</span>
              <span>Q</span>
              <span>Q</span>
              <span>S</span>
              <span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {gerarDiasCalendario().map((item, idx) =>
                item ? (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-medium ${
                      item.foi
                        ? 'bg-[#8C6D53] text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-[#6E675F]'
                    }`}
                  >
                    {item.dia}
                  </div>
                ) : (
                  <div key={idx} />
                )
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-[#2C2A29] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#8C6D53]" />
              Diário de Reflexões
            </h3>

            {presencas.filter((p) => p.reflexao && p.reflexao.trim() !== '').length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] text-center">
                <p className="text-xs text-[#6E675F]">
                  Suas reflexões pós-celebração aparecerão aqui para você reler sempre que quiser.
                </p>
              </div>
            ) : (
              presencas
                .filter((p) => p.reflexao && p.reflexao.trim() !== '')
                .map((p) => {
                  const [ano, mes, dia] = p.data_presenca.split('-')
                  return (
                    <div
                      key={p.id}
                      className="bg-white p-4 rounded-2xl border border-[#EAE2D6] space-y-2"
                    >
                      <span className="text-[11px] font-semibold text-[#8C6D53] bg-[#FAF7F2] px-2.5 py-1 rounded-full">
                        {dia}/{mes}/{ano}
                      </span>
                      <p className="text-sm text-[#2C2A29] leading-relaxed whitespace-pre-line">
                        “{p.reflexao}”
                      </p>
                    </div>
                  )
                })
            )}
          </section>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#EAE2D6] px-4 py-2.5 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab('hoje')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            activeTab === 'hoje' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <Church className="w-5 h-5" />
          <span>Hoje</span>
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            activeTab === 'agenda' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Horários</span>
        </button>

        <button
          onClick={() => setActiveTab('paroquia')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            activeTab === 'paroquia' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Paróquia</span>
        </button>

        <button
          onClick={() => setActiveTab('caminhada')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            activeTab === 'caminhada' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Caminhada</span>
        </button>
      </nav>
    </div>
  )
}