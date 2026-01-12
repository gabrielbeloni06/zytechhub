'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  ArrowLeft, Inbox, CheckCircle, Code, 
  Calendar, MessageSquare, Monitor, Filter, 
  Zap, ChevronDown, ChevronUp, Eye, FileText
} from 'lucide-react'

export default function FormsInboxPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'today', 'week', 'month'
  const [expandedJson, setExpandedJson] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads_zytech')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setLeads(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function markAsViewed(id: string) {
    // Atualiza no banco
    await supabase.from('leads_zytech').update({ status: 'viewed' }).eq('id', id)
    
    // Atualiza na tela instantaneamente
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, status: 'viewed' } : lead
    ))
  }

  // --- Lógica de Datas (Javascript Puro - Sem Bibliotecas Extras) ---
  const checkDate = (dateString: string, type: string) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const now = new Date()
    
    // Zera as horas para comparar apenas o dia
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (type === 'today') {
      return d1.getTime() === d2.getTime()
    }
    if (type === 'week') {
      const diffTime = Math.abs(d2.getTime() - d1.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }
    if (type === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }
    return true
  }

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true
    return checkDate(lead.created_at, filter)
  })

  // --- Componente: Tradutor de JSON para Humano ---
  const LeadTranslator = ({ data, category, plan }: any) => {
    if (!data) return <span className="text-zinc-600">Sem dados técnicos.</span>

    return (
      <div className="space-y-4 text-sm mt-4">
        <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                {plan}
            </span>
            <span className="text-zinc-500 text-xs uppercase tracking-wide">via {category}</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
            {category === 'chatbot' ? (
                <>
                    {data.link_catalogo && (
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                           <p className="text-zinc-400 text-xs mb-1">Material de Base</p>
                           <a href={data.link_catalogo} target="_blank" className="text-blue-400 hover:text-blue-300 truncate block underline">
                                {data.link_catalogo}
                           </a>
                        </div>
                    )}
                    {data.saudacao && (
                        <div>
                            <p className="text-zinc-500 text-xs uppercase font-bold">Saudação</p>
                            <p className="text-white">"{data.saudacao}"</p>
                        </div>
                    )}
                    {data.bot_logica && (
                        <div>
                             <p className="text-zinc-500 text-xs uppercase font-bold">Lógica Solicitada</p>
                             <p className="text-zinc-300 italic">"{data.bot_logica}"</p>
                        </div>
                    )}
                    {data.bot_persona && (
                        <div>
                             <p className="text-zinc-500 text-xs uppercase font-bold">Persona da IA</p>
                             <p className="text-purple-300">{data.bot_persona}</p>
                        </div>
                    )}
                </>
            ) : (
                // Lógica para Websites
                <>
                    <div className="flex gap-4">
                        <div>
                            <p className="text-zinc-500 text-xs uppercase font-bold">Identidade Visual</p>
                            <p className="text-white">{data.identidade === 'sim' ? 'Já possui Logo' : 'Precisa criar'}</p>
                        </div>
                        {data.login && (
                            <div>
                                <p className="text-zinc-500 text-xs uppercase font-bold">Área de Login</p>
                                <p className="text-white">{data.login}</p>
                            </div>
                        )}
                    </div>
                    {data.referencias && (
                        <div>
                             <p className="text-zinc-500 text-xs uppercase font-bold">Referências</p>
                             <p className="text-zinc-300">{data.referencias}</p>
                        </div>
                    )}
                    {data.site_paginas && (
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                             <p className="text-zinc-400 text-xs mb-1">Estrutura de Páginas</p>
                             <p className="text-white whitespace-pre-wrap">{data.site_paginas}</p>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden">
      
      {/* Background igual ao dashboard */}
      <div className="fixed inset-0 bg-gradient-to-t from-black via-black/90 to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 gap-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-2 text-sm transition-colors">
                <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">Caixa de Entrada</h1>
            <p className="text-zinc-400 text-sm tracking-wide">
                Você tem <span className="text-white font-bold">{leads.filter(l => l.status !== 'viewed').length}</span> novos pedidos aguardando análise.
            </p>
          </div>
          
          {/* Filtros */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {['all', 'month', 'week', 'today'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                        filter === f ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                    }`}
                >
                    {f === 'all' ? 'Todos' : f === 'today' ? 'Hoje' : f === 'week' ? 'Semana' : 'Mês'}
                </button>
            ))}
          </div>
        </div>

        {/* Lista de Leads */}
        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-20 text-zinc-500 animate-pulse">Carregando pedidos...</div>
            ) : filteredLeads.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                    <Inbox size={48} className="mx-auto text-zinc-700 mb-4"/>
                    <p className="text-zinc-500">Nenhum pedido encontrado neste período.</p>
                </div>
            ) : (
                filteredLeads.map((lead) => (
                    <div 
                        key={lead.id} 
                        className={`group relative overflow-hidden rounded-3xl border transition-all duration-300
                            ${lead.status === 'viewed' 
                                ? 'bg-black/40 border-white/5 opacity-60 hover:opacity-100' 
                                : 'bg-zinc-900/50 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]'
                            }`}
                    >
                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Coluna Esquerda: Info Básica */}
                            <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl border border-white/10 ${lead.categoria_servico === 'chatbot' ? 'bg-purple-900/20 text-purple-400' : 'bg-blue-900/20 text-blue-400'}`}>
                                        {lead.categoria_servico === 'chatbot' ? <MessageSquare size={20}/> : <Monitor size={20}/>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{lead.nome_empresa}</h3>
                                        <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                                            <Calendar size={10} /> 
                                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">WhatsApp</p>
                                        <p className="text-sm font-mono text-zinc-300">{lead.whatsapp}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Segmento</p>
                                        <p className="text-sm text-zinc-300">
                                            {lead.segmento || 'Não inf.'} 
                                            {lead.ramo_atividade && <span className="text-zinc-500"> ({lead.ramo_atividade})</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna Direita: Dados Técnicos (Translator) */}
                            <div className="lg:col-span-8 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <FileText size={14}/> Detalhes do Projeto
                                    </h4>
                                    
                                    {/* Componente que traduz o JSON */}
                                    <LeadTranslator 
                                        data={lead.dados_tecnicos} 
                                        category={lead.categoria_servico} 
                                        plan={lead.produto_plano} 
                                    />
                                </div>

                                {/* Ações */}
                                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                    <button 
                                        onClick={() => setExpandedJson(expandedJson === lead.id ? null : lead.id)}
                                        className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider flex items-center gap-2 transition-colors"
                                    >
                                        <Code size={14} /> 
                                        {expandedJson === lead.id ? 'Esconder JSON' : 'Ver Código'}
                                    </button>

                                    {lead.status !== 'viewed' ? (
                                        <button 
                                            onClick={() => markAsViewed(lead.id)}
                                            className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Marcar Visto
                                        </button>
                                    ) : (
                                        <span className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                            <CheckCircle size={14} /> Visualizado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dropdown JSON Raw (Opcional) */}
                        {expandedJson === lead.id && (
                            <div className="bg-black border-t border-white/10 p-6 font-mono text-xs text-green-500 overflow-x-auto">
                                <pre>{JSON.stringify(lead, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  )
}