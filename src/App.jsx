import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import {
  Church,
  Calendar,
  CheckCircle2,
  Heart,
  Clock,
  User,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  ExternalLink,
  Megaphone,
  MessageCircle,
  Globe,
  Share2,
  ShieldCheck,
  Download,
  Copy,
  Check,
  QrCode,
  Smartphone,
  Search,
  Plus,
  Trash2
} from 'lucide-react'

const COORDENADOR_EMAILS = ['coordenacaobp@gmail.com']

const DIZIMO_CONFIG = {
  favorecido: 'Paróquia Bom Pastor',
  tipoChave: 'CNPJ',
  chavePix: '00.000.000/0001-00', // Substitua pela chave Pix oficial da paróquia
  mensagem:
    'Sua contribuição sustenta a vida da comunidade, as obras pastorais e o cuidado com os que mais precisam.'
}

const APP_INSTALL_URL = 'https://paroquia-bom-pastor.vercel.app' // Substitua pelo link real da sua Vercel

const VERSICULOS_PADRAO = [
  { id: 'padrao-1', texto: 'O Senhor é o meu pastor; nada me faltará.', referencia: 'Salmo 23, 1' },
  { id: 'padrao-2', texto: 'Vinde a mim, todos vós que estais cansados e oprimidos, e eu vos aliviarei.', referencia: 'Mateus 11, 28' },
  { id: 'padrao-3', texto: 'Tudo posso naquele que me fortalece.', referencia: 'Filipenses 4, 13' },
  { id: 'padrao-4', texto: 'Amai-vos uns aos outros como eu vos amei.', referencia: 'João 15, 12' },
  { id: 'padrao-5', texto: 'O Senhor te abençoe e te guarde; o Senhor faça brilhar sobre ti a sua face.', referencia: 'Números 6, 24-25' },
  { id: 'padrao-6', texto: 'Entrega o teu caminho ao Senhor, confia nele, e ele tudo fará.', referencia: 'Salmo 37, 5' },
  { id: 'padrao-7', texto: 'A paz eu vos deixo, a minha paz eu vos dou.', referencia: 'João 14, 27' },
  { id: 'padrao-8', texto: 'Sede fortes e corajosos, não tenhais medo.', referencia: 'Deuteronômio 31, 6' },
  { id: 'padrao-9', texto: 'Onde dois ou três estiverem reunidos em meu nome, aí estou eu no meio deles.', referencia: 'Mateus 18, 20' },
  { id: 'padrao-10', texto: 'A tua palavra é lâmpada para os meus passos e luz para o meu caminho.', referencia: 'Salmo 119, 105' },
  { id: 'padrao-11', texto: 'Buscai primeiro o Reino de Deus e a sua justiça, e tudo isso vos será dado por acréscimo.', referencia: 'Mateus 6, 33' },
  { id: 'padrao-12', texto: 'O Senhor é bom, um refúgio no dia da angústia.', referencia: 'Naum 1, 7' },
  { id: 'padrao-13', texto: 'Alegrai-vos sempre no Senhor; repito: alegrai-vos.', referencia: 'Filipenses 4, 4' },
  { id: 'padrao-14', texto: 'Eu sou o caminho, a verdade e a vida.', referencia: 'João 14, 6' },
  { id: 'padrao-15', texto: 'Ainda que eu ande por um vale de sombra e morte, não temerei mal algum, porque tu estás comigo.', referencia: 'Salmo 23, 4' },
  { id: 'padrao-16', texto: 'A fé sem obras é morta.', referencia: 'Tiago 2, 26' },
  { id: 'padrao-17', texto: 'O amor é paciente, o amor é prestativo.', referencia: '1 Coríntios 13, 4' },
  { id: 'padrao-18', texto: 'Felizes os que têm um coração puro, porque verão a Deus.', referencia: 'Mateus 5, 8' },
  { id: 'padrao-19', texto: 'Não vos inquieteis pelo dia de amanhã, pois o dia de amanhã trará suas próprias preocupações.', referencia: 'Mateus 6, 34' },
  { id: 'padrao-20', texto: 'Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios.', referencia: 'Salmo 103, 2' }
]

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
  const [erroCatCoord, setErroCatCoord] = useState('')
  const [nomeCatequizando, setNomeCatequizando] = useState('')
  const [idadeCatequizando, setIdadeCatequizando] = useState('')
  const [etapaCatequese, setEtapaCatequese] = useState('Eucaristia (Infantil)')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [whatsappCat, setWhatsappCat] = useState('')
  const [obsCat, setObsCat] = useState('')
  const [enviandoCat, setEnviandoCat] = useState(false)
  const [sucessoCat, setSucessoCat] = useState('')

  const [buscaCoord, setBuscaCoord] = useState('')
  const [filtroEtapaCoord, setFiltroEtapaCoord] = useState('TODAS')

  const [novaAgenda, setNovaAgenda] = useState({
    dia_semana: '',
    horario: '',
    celebrante: '',
    observacao: ''
  })
  const [adicionandoAgenda, setAdicionandoAgenda] = useState(false)

  const [editandoAgendaId, setEditandoAgendaId] = useState(null)
  const [formAgenda, setFormAgenda] = useState({
    dia_semana: '',
    horario: '',
    celebrante: '',
    observacao: ''
  })
  const [salvandoAgenda, setSalvandoAgenda] = useState(false)
  const [msgAgenda, setMsgAgenda] = useState('')

  const [copiouPix, setCopiouPix] = useState(false)
  const [mesAtual, setMesAtual] = useState(new Date())

  const isCoordenador = Boolean(
    session?.user?.email &&
      COORDENADOR_EMAILS.includes(session.user.email.trim().toLowerCase())
  )

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
    if (!isCoordenador && activeTab === 'coord') {
      setActiveTab('hoje')
    }
  }, [isCoordenador, activeTab])

  useEffect(() => {
    setReflexaoTexto(presencaHoje?.reflexao || '')
  }, [presencaHoje])

  async function carregarInscricoesCatequese() {
    setErroCatCoord('')

    let { data, error } = await supabase
      .from('inscricoes_catequese')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      const fallback = await supabase.from('inscricoes_catequese').select('*')
      data = fallback.data
      error = fallback.error
    }

    if (error) {
      setErroCatCoord(error.message)
      return
    }

    if (data) {
      setInscricoesCat(data)
    }
  }

  async function carregarDados() {
    const { data: versData } = await supabase.from('versiculos').select('*')
    if (versData && versData.length > 0) {
      const textosExistentes = new Set(
        versData.map((item) => (item.texto || '').trim().toLowerCase())
      )
      const extrasPadrao = VERSICULOS_PADRAO.filter(
        (item) => !textosExistentes.has(item.texto.trim().toLowerCase())
      )
      setVersiculos([...versData, ...extrasPadrao])
    } else {
      setVersiculos(VERSICULOS_PADRAO)
    }

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

    await carregarInscricoesCatequese()
  }

  async function adicionarAgenda(e) {
    e.preventDefault()
    if (!isCoordenador) return
    setAdicionandoAgenda(true)
    setMsgAgenda('')

    const proximaOrdem =
      agenda.length > 0
        ? Math.max(...agenda.map((item) => Number(item.ordem) || 0)) + 1
        : 1

    const { data, error } = await supabase
      .from('agenda_igreja')
      .insert({
        dia_semana: novaAgenda.dia_semana.trim(),
        horario: novaAgenda.horario.trim(),
        celebrante: novaAgenda.celebrante.trim(),
        observacao: novaAgenda.observacao.trim(),
        ordem: proximaOrdem
      })
      .select()
      .single()

    setAdicionandoAgenda(false)

    if (error) {
      setMsgAgenda(`Erro ao adicionar: ${error.message}`)
      return
    }

    if (data) {
      setAgenda((prev) => [...prev, data])
      setNovaAgenda({
        dia_semana: '',
        horario: '',
        celebrante: '',
        observacao: ''
      })
      setMsgAgenda('Nova celebração adicionada à agenda!')
      setTimeout(() => setMsgAgenda(''), 3000)
    }
  }

  function iniciarEdicaoAgenda(item) {
    setEditandoAgendaId(item.id)
    setMsgAgenda('')
    setFormAgenda({
      dia_semana: item.dia_semana || '',
      horario: item.horario || '',
      celebrante: item.celebrante || '',
      observacao: item.observacao || ''
    })
  }

  function cancelarEdicaoAgenda() {
    setEditandoAgendaId(null)
    setMsgAgenda('')
  }

  async function salvarEdicaoAgenda(e, id) {
    e.preventDefault()
    if (!isCoordenador) return
    setSalvandoAgenda(true)
    setMsgAgenda('')

    const { data, error } = await supabase
      .from('agenda_igreja')
      .update({
        dia_semana: formAgenda.dia_semana.trim(),
        horario: formAgenda.horario.trim(),
        celebrante: formAgenda.celebrante.trim(),
        observacao: formAgenda.observacao.trim()
      })
      .eq('id', id)
      .select()
      .single()

    setSalvandoAgenda(false)

    if (error) {
      setMsgAgenda(`Erro ao salvar: ${error.message}`)
      return
    }

    if (data) {
      setAgenda((prev) => prev.map((item) => (item.id === id ? data : item)))
      setEditandoAgendaId(null)
      setMsgAgenda('Agenda atualizada com sucesso!')
      setTimeout(() => setMsgAgenda(''), 3000)
    }
  }

  async function excluirAgenda(id) {
    if (!isCoordenador) return
    if (!window.confirm('Deseja remover esta celebração da agenda?')) return

    const { error } = await supabase.from('agenda_igreja').delete().eq('id', id)
    if (error) {
      setMsgAgenda(`Erro ao remover: ${error.message}`)
      return
    }

    setAgenda((prev) => prev.filter((item) => item.id !== id))
    if (editandoAgendaId === id) setEditandoAgendaId(null)
    setMsgAgenda('Celebração removida da agenda.')
    setTimeout(() => setMsgAgenda(''), 3000)
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

  async function handleCopiarPix() {
    try {
      await navigator.clipboard.writeText(DIZIMO_CONFIG.chavePix)
      setCopiouPix(true)
      setTimeout(() => setCopiouPix(false), 2500)
    } catch {
      setCopiouPix(false)
    }
  }

  function escaparCsv(valor) {
    const texto = String(valor ?? '').replace(/"/g, '""')
    return `"${texto}"`
  }

  function exportarInscricoesCsv() {
    if (!isCoordenador || inscricoesFiltradas.length === 0) return

    const cabecalho = [
      'Catequizando',
      'Idade',
      'Etapa',
      'Responsavel',
      'WhatsApp',
      'Observacao',
      'Data Cadastro'
    ]

    const linhas = inscricoesFiltradas.map((item) => [
      escaparCsv(item.nome_catequizando),
      escaparCsv(item.idade),
      escaparCsv(item.etapa),
      escaparCsv(item.nome_responsavel),
      escaparCsv(item.whatsapp),
      escaparCsv(item.observacao),
      escaparCsv(
        item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : ''
      )
    ])

    const conteudoCsv =
      '\uFEFF' +
      [cabecalho.map(escaparCsv).join(';'), ...linhas.map((l) => l.join(';'))].join('\n')

    const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `catequese-inscricoes-${hojeStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const inscricoesFiltradas = inscricoesCat.filter((ins) => {
    const bateEtapa =
      filtroEtapaCoord === 'TODAS' || ins.etapa === filtroEtapaCoord
    const termo = buscaCoord.trim().toLowerCase()
    const bateBusca =
      !termo ||
      (ins.nome_catequizando || '').toLowerCase().includes(termo) ||
      (ins.nome_responsavel || '').toLowerCase().includes(termo) ||
      (ins.whatsapp || '').toLowerCase().includes(termo)
    return bateEtapa && bateBusca
  })

  const getIndiceVersiculoDoDia = (total) => {
    if (!total) return 0
    const partes = hojeStr.split('-').map(Number)
    const dataUtc = Date.UTC(partes[0], partes[1] - 1, partes[2])
    const diasDesdeEpoca = Math.floor(dataUtc / 86400000)
    return ((diasDesdeEpoca % total) + total) % total
  }

  const listaBaseVersiculos = versiculos.length > 0 ? versiculos : VERSICULOS_PADRAO

  const versiculosDoDia = (() => {
    if (listaBaseVersiculos.length <= 1) return listaBaseVersiculos
    const idx = getIndiceVersiculoDoDia(listaBaseVersiculos.length)
    const copia = [...listaBaseVersiculos]
    const [destaque] = copia.splice(idx, 1)
    return [destaque, ...copia]
  })()

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
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    APP_INSTALL_URL
  )}`

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 max-w-md mx-auto relative shadow-xs">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE2D6] flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-xs">
            <img
              src="/logo-bom-pastor.jpg"
              alt="Logo Bom Pastor"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#8C6D53] font-medium uppercase tracking-wider truncate">
              Paróquia Bom Pastor
            </p>
            <h1 className="text-xl font-semibold text-[#2C2A29] capitalize truncate">
              Paz e bem, {nomeUsuario}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('instalar')}
            title="QR Code e instalar app"
            className={`p-2.5 rounded-full border transition ${
              activeTab === 'instalar'
                ? 'bg-[#8C6D53] border-[#8C6D53] text-white'
                : 'bg-white border-[#EAE2D6] text-[#6E675F] hover:text-[#8C6D53]'
            }`}
          >
            <QrCode className="w-4 h-4" />
          </button>

          {isCoordenador && (
            <button
              type="button"
              onClick={() => setActiveTab('coord')}
              title="Painel da coordenação"
              className={`p-2.5 rounded-full border transition ${
                activeTab === 'coord'
                  ? 'bg-[#5C6F68] border-[#5C6F68] text-white'
                  : 'bg-white border-[#EAE2D6] text-[#5C6F68] hover:bg-[#5C6F68]/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            title="Sair da conta"
            className="p-2.5 rounded-full bg-white border border-[#EAE2D6] text-[#6E675F] hover:text-[#8C6D53] transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
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
              {versiculosDoDia.map((v, idx) => (
                <div
                  key={v.id ?? `${v.referencia}-${idx}`}
                  className="snap-center shrink-0 w-[85%] bg-gradient-to-br from-[#8C6D53] to-[#6E533D] text-white p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[150px]"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-[#FAF7F2]">
                      {idx === 0 ? 'Versículo de hoje' : 'Outras leituras'}
                    </span>
                  </div>
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
              type="button"
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
                <Church className="w-4 h-4 text-[#8C6D53]" />
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
          </section>
        </main>
      )}

      {activeTab === 'caminhada' && (
        <main className="px-6 space-y-6">
          <section className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
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
                type="button"
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
                    className={`h-9 rounded-xl flex items-center justify-center text-xs font-medium ${
                      item.foi
                        ? 'bg-[#5C6F68] text-white font-semibold'
                        : item.dataFormatada === hojeStr
                          ? 'bg-[#FAF7F2] border border-[#8C6D53] text-[#8C6D53] font-semibold'
                          : 'text-[#2C2A29]'
                    }`}
                  >
                    {item.dia}
                  </div>
                ) : (
                  <div key={idx} className="h-9" />
                )
              )}
            </div>
          </section>

          <section className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#2C2A29] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#D4A373]" />
              Diário de Reflexões
            </h3>
            {presencas.filter((p) => p.reflexao).length === 0 ? (
              <p className="text-xs text-[#6E675F]">
                Nenhuma reflexão registrada ainda. Marque sua presença na aba Hoje para escrever.
              </p>
            ) : (
              <div className="space-y-2.5">
                {presencas
                  .filter((p) => p.reflexao)
                  .slice(0, 6)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D6] space-y-1"
                    >
                      <p className="text-[11px] font-semibold text-[#8C6D53]">
                        {p.data_presenca}
                      </p>
                      <p className="text-xs text-[#2C2A29] leading-relaxed">
                        {p.reflexao}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </main>
      )}

      {activeTab === 'dizimos' && (
        <main className="px-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#2C2A29]">Dízimos e Ofertas</h2>
            <p className="text-xs text-[#6E675F] mt-0.5 leading-relaxed">
              {DIZIMO_CONFIG.mensagem}
            </p>
          </div>

          <section className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-xs space-y-4">
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-[#8C6D53]">
                Chave Pix ({DIZIMO_CONFIG.tipoChave})
              </p>
              <p className="text-sm font-semibold text-[#2C2A29]">
                {DIZIMO_CONFIG.favorecido}
              </p>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-xs font-mono text-[#2C2A29] break-all">
                {DIZIMO_CONFIG.chavePix}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopiarPix}
              className="w-full py-3.5 px-4 rounded-xl bg-[#8C6D53] hover:bg-[#775B44] text-white text-xs font-medium flex items-center justify-center gap-2 transition"
            >
              {copiouPix ? (
                <>
                  <Check className="w-4 h-4" />
                  Chave Pix copiada!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar chave Pix
                </>
              )}
            </button>
          </section>
        </main>
      )}

      {activeTab === 'instalar' && (
        <main className="px-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#2C2A29] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#8C6D53]" />
              Instalar Aplicativo
            </h2>
            <p className="text-xs text-[#6E675F] mt-0.5">
              Escaneie o QR Code ou siga o passo a passo para manter o app na tela inicial.
            </p>
          </div>

          <section className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-xs text-center space-y-3">
            <img
              src={qrCodeSrc}
              alt="QR Code para abrir e instalar o app da Paróquia Bom Pastor"
              className="w-48 h-48 mx-auto rounded-2xl border border-[#EAE2D6] p-2 bg-white"
            />
            <p className="text-[11px] text-[#6E675F] break-all">
              Link do app:{' '}
              <a
                href={APP_INSTALL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8C6D53] underline font-medium"
              >
                {APP_INSTALL_URL}
              </a>
            </p>
          </section>

          <section className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#2C2A29] flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#5C6F68]" />
              Como instalar no celular
            </h3>
            <p className="text-xs text-[#4A453E] leading-relaxed">
              <strong className="text-[#2C2A29]">Android (Chrome):</strong> Abra o link no Chrome, toque nos três pontinhos (⋮) e escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.
            </p>
            <p className="text-xs text-[#4A453E] leading-relaxed">
              <strong className="text-[#2C2A29]">iPhone (Safari):</strong> Abra o link no Safari, toque em <strong>Compartilhar</strong> e escolha <strong>Adicionar à Tela de Início</strong>.
            </p>
          </section>
        </main>
      )}

      {activeTab === 'coord' && isCoordenador && (
        <main className="px-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[#2C2A29] flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-[#8C6D53]" />
                Coordenação
              </h2>
              <p className="text-xs text-[#6E675F]">
                Gerenciar celebrações e inscrições da catequese
              </p>
            </div>

            <button
              type="button"
              onClick={exportarInscricoesCsv}
              disabled={inscricoesFiltradas.length === 0}
              className="px-3.5 py-2.5 rounded-xl bg-[#5C6F68] hover:bg-[#4B5B55] text-white text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-40 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>

          <section className="bg-white p-4 rounded-2xl border border-[#EAE2D6] space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[#2C2A29]">
                Dias, Horários e Celebrantes
              </h3>
              <p className="text-xs text-[#6E675F]">
                Adicione, edite ou remova celebrações exibidas na aba Agenda
              </p>
            </div>

            {msgAgenda && (
              <p className="text-xs font-medium text-[#5C6F68] bg-[#5C6F68]/10 p-2.5 rounded-xl">
                {msgAgenda}
              </p>
            )}

            <form
              onSubmit={adicionarAgenda}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D6] space-y-2.5 text-xs"
            >
              <p className="font-semibold text-[#2C2A29] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#8C6D53]" />
                Adicionar novo dia ou horário
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#6E675F] mb-1">
                    Dia da semana
                  </label>
                  <input
                    type="text"
                    required
                    value={novaAgenda.dia_semana}
                    onChange={(e) =>
                      setNovaAgenda({ ...novaAgenda, dia_semana: e.target.value })
                    }
                    placeholder="Ex: Sábado"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE2D6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#6E675F] mb-1">
                    Horário
                  </label>
                  <input
                    type="text"
                    required
                    value={novaAgenda.horario}
                    onChange={(e) =>
                      setNovaAgenda({ ...novaAgenda, horario: e.target.value })
                    }
                    placeholder="Ex: 18:00"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE2D6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6E675F] mb-1">
                  Celebrante / Pastor
                </label>
                <input
                  type="text"
                  required
                  value={novaAgenda.celebrante}
                  onChange={(e) =>
                    setNovaAgenda({ ...novaAgenda, celebrante: e.target.value })
                  }
                  placeholder="Nome do padre ou pastor"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE2D6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6E675F] mb-1">
                  Observação (opcional)
                </label>
                <input
                  type="text"
                  value={novaAgenda.observacao}
                  onChange={(e) =>
                    setNovaAgenda({ ...novaAgenda, observacao: e.target.value })
                  }
                  placeholder="Ex: Missa da Família"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE2D6]"
                />
              </div>

              <button
                type="submit"
                disabled={adicionandoAgenda}
                className="w-full py-2.5 rounded-xl bg-[#8C6D53] hover:bg-[#775B44] text-white font-medium transition disabled:opacity-50"
              >
                {adicionandoAgenda ? 'Adicionando...' : 'Adicionar celebração'}
              </button>
            </form>

            <div className="space-y-2.5">
              {agenda.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D6] space-y-2.5"
                >
                  {editandoAgendaId === item.id ? (
                    <form
                      onSubmit={(e) => salvarEdicaoAgenda(e, item.id)}
                      className="space-y-2.5 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-[#6E675F] mb-1">
                            Dia da semana
                          </label>
                          <input
                            type="text"
                            required
                            value={formAgenda.dia_semana}
                            onChange={(e) =>
                              setFormAgenda({ ...formAgenda, dia_semana: e.target.value })
                            }
                            placeholder="Ex: Domingo"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE2D6]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#6E675F] mb-1">
                            Horário
                          </label>
                          <input
                            type="text"
                            required
                            value={formAgenda.horario}
                            onChange={(e) =>
                              setFormAgenda({ ...formAgenda, horario: e.target.value })
                            }
                            placeholder="Ex: 08:00"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE2D6]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#6E675F] mb-1">
                          Celebrante / Pastor
                        </label>
                        <input
                          type="text"
                          required
                          value={formAgenda.celebrante}
                          onChange={(e) =>
                            setFormAgenda({ ...formAgenda, celebrante: e.target.value })
                          }
                          placeholder="Nome do padre ou pastor"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE2D6]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#6E675F] mb-1">
                          Observação (opcional)
                        </label>
                        <input
                          type="text"
                          value={formAgenda.observacao}
                          onChange={(e) =>
                            setFormAgenda({ ...formAgenda, observacao: e.target.value })
                          }
                          placeholder="Ex: Celebração da Manhã"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE2D6]"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelarEdicaoAgenda}
                          className="px-3 py-1.5 rounded-xl border border-[#EAE2D6] bg-white text-[#6E675F] font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={salvandoAgenda}
                          className="px-3.5 py-1.5 rounded-xl bg-[#8C6D53] text-white font-medium disabled:opacity-50"
                        >
                          {salvandoAgenda ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-[#2C2A29]">
                          {item.dia_semana} • {item.horario}
                        </p>
                        <p className="text-[#6E675F]">
                          Celebrante: <strong className="text-[#2C2A29]">{item.celebrante}</strong>
                        </p>
                        {item.observacao && (
                          <p className="text-[#6E675F]">Obs.: {item.observacao}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => iniciarEdicaoAgenda(item)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE2D6] text-[#8C6D53] font-medium hover:bg-[#8C6D53] hover:text-white transition"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => excluirAgenda(item.id)}
                          title="Remover celebração"
                          className="p-1.5 rounded-xl bg-white border border-[#EAE2D6] text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {erroCatCoord && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs">
              Não foi possível carregar as inscrições: {erroCatCoord}
            </div>
          )}

          <section className="bg-white p-4 rounded-2xl border border-[#EAE2D6] space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#2C2A29]">
                Inscrições da Catequese
              </h3>
              <span className="text-xs text-[#6E675F]">
                {inscricoesFiltradas.length} cadastro(s)
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#8E867E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={buscaCoord}
                onChange={(e) => setBuscaCoord(e.target.value)}
                placeholder="Buscar por catequizando, responsável ou WhatsApp"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-xs focus:outline-none focus:border-[#8C6D53]"
              />
            </div>

            <select
              value={filtroEtapaCoord}
              onChange={(e) => setFiltroEtapaCoord(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE2D6] text-xs focus:outline-none focus:border-[#8C6D53]"
            >
              <option value="TODAS">Todas as etapas</option>
              <option value="Eucaristia (Infantil)">Eucaristia (Infantil)</option>
              <option value="Perseverança">Perseverança</option>
              <option value="Crisma (Jovens)">Crisma (Jovens)</option>
              <option value="Catequese de Adultos">Catequese de Adultos</option>
            </select>
          </section>

          <section className="space-y-2.5">
            {inscricoesFiltradas.length === 0 ? (
              <div className="bg-white p-5 rounded-2xl border border-[#EAE2D6] text-center text-xs text-[#6E675F]">
                Nenhuma inscrição encontrada com o filtro atual.
              </div>
            ) : (
              inscricoesFiltradas.map((ins) => (
                <div
                  key={ins.id}
                  className="bg-white p-4 rounded-2xl border border-[#EAE2D6] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-[#2C2A29]">
                      {ins.nome_catequizando}
                    </p>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE2D6] text-[#8C6D53] font-semibold text-[11px]">
                      {ins.idade} anos
                    </span>
                  </div>
                  <p className="text-[#8C6D53] font-medium">{ins.etapa}</p>
                  {ins.nome_responsavel && (
                    <p className="text-[#6E675F]">
                      Responsável: <strong className="text-[#2C2A29]">{ins.nome_responsavel}</strong>
                    </p>
                  )}
                  <p className="text-[#6E675F]">
                    WhatsApp: <strong className="text-[#2C2A29]">{ins.whatsapp}</strong>
                  </p>
                  {ins.observacao && (
                    <p className="text-[#6E675F]">Obs.: {ins.observacao}</p>
                  )}
                </div>
              ))
            )}
          </section>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-[#EAE2D6] px-3 py-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('hoje')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'hoje' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hoje</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'agenda' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Agenda</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paroquia')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'paroquia' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <Church className="w-4 h-4" />
          <span>Paróquia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('caminhada')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'caminhada' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Caminhada</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dizimos')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
            activeTab === 'dizimos' ? 'text-[#8C6D53]' : 'text-[#8E867E]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Dízimos</span>
        </button>
      </nav>
    </div>
  )
}