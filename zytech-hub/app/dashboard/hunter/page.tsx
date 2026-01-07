'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, Check, Trash2, Search, Users, MessageCircle, Phone, MapPin, RefreshCcw } from 'lucide-react'

interface GoogleLead {
  nome: string
  telefone_api: string
  tipo: string
  endereco: string
  rating: number
  saved?: boolean 
}

interface DbLead {
  id: string
  nome: string
  telefone: string
  tipo: string
  endereco: string
  rating: string
  status: 'new' | 'contacted'
  created_at: string
}

export default function HunterPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'list'>('search')
  const [listTab, setListTab] = useState<'new' | 'contacted'>('new')
  
  const [termo, setTermo] = useState('')
  const [cidade, setCidade] = useState('Belo Horizonte')
  const [searchResults, setSearchResults] = useState<GoogleLead[]>([])
  const [searching, setSearching] = useState(false)

  const [savedLeads, setSavedLeads] = useState<DbLead[]>([])
  const [loadingList, setLoadingList] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (activeTab === 'list') {
      fetchSavedLeads()
    }
  }, [activeTab])

  const searchLeads = async () => {
    setSearching(true)
    try {
      const res = await fetch('/api/hunter', {
        method: 'POST',
        body: JSON.stringify({ termo, cidade }),
      })
      const data = await res.json()
      setSearchResults(data.leads || [])
    } catch (error) {
      alert('Erro ao buscar na API')
    }
    setSearching(false)
  }

  const fetchSavedLeads = async () => {
    setLoadingList(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setSavedLeads(data as DbLead[])
    setLoadingList(false)
  }

  const saveLead = async (lead: GoogleLead, index: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Faça login novamente')

    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      nome: lead.nome,
      telefone: lead.telefone_api,
      tipo: lead.tipo,
      endereco: lead.endereco,
      rating: lead.rating.toString(),
      status: 'new' 
    })

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      const newResults = [...searchResults]
      newResults[index].saved = true
      setSearchResults(newResults)
      fetchSavedLeads()
    }
  }

  const deleteSavedLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return

    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) {
      alert('Erro ao deletar')
    } else {
      setSavedLeads(prev => prev.filter(l => l.id !== id))
    }
  }

  const markAsContacted = async (id: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', id)
    
    if (!error) {
      setSavedLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'contacted' } : l))
    }
  }

  const markAsNew = async (id: string) => {
    const { error } = await supabase.from('leads').update({ status: 'new' }).eq('id', id)
    if (!error) {
      setSavedLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'new' } : l))
    }
  }

  const filteredSavedLeads = savedLeads.filter(l => l.status === listTab)

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 flex items-center gap-3">
               Lead Hunter <span className="text-2xl">🕵️‍♂️</span>
            </h1>
            <p className="text-slate-400 mt-1">Busque leads qualificados no Google e gerencie sua prospecção.</p>
          </div>
          
          {/* ABAS PRINCIPAIS */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'search' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Search size={16}/> Buscar Leads
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'list' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Users size={16}/> Meus Leads
            </button>
          </div>
        </div>

        {activeTab === 'search' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-4 mb-8 flex-col md:flex-row bg-slate-900/50 p-5 rounded-2xl border border-slate-800/50 shadow-xl">
              <input 
                value={termo}
                onChange={e => setTermo(e.target.value)}
                placeholder="O que você procura? (Ex: Imobiliária, Pizzaria)" 
                className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-green-500 outline-none transition-colors"
              />
              <input 
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Cidade" 
                className="w-full md:w-64 p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-green-500 outline-none transition-colors"
              />
              <button 
                onClick={searchLeads}
                disabled={searching}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                {searching ? <Loader2 className="animate-spin" /> : <Search size={20}/>}
                Buscar
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-5">Nome</th>
                      <th className="p-5">Contato</th>
                      <th className="p-5">Endereço</th>
                      <th className="p-5 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {searchResults.map((lead, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-5 font-medium text-white">{lead.nome}</td>
                        <td className="p-5">
                          <div className="flex flex-col">
                            <span className="font-mono text-green-400">{lead.telefone_api}</span>
                            <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded mt-1 font-bold ${lead.tipo === 'CELULAR' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-700 text-slate-400'}`}>
                              {lead.tipo}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-sm text-slate-400 max-w-md truncate" title={lead.endereco}>
                           {lead.endereco}
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => saveLead(lead, i)}
                            disabled={lead.saved}
                            className={`p-2.5 rounded-lg transition-all ${lead.saved ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95'}`}
                            title="Salvar na Base"
                          >
                            {lead.saved ? <Check size={18} /> : <Save size={18} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
           <div className="animate-in fade-in slide-in-from-bottom-2">
             <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setListTab('new')}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${listTab === 'new' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
                    >
                        Novos ({savedLeads.filter(l => l.status === 'new').length})
                    </button>
                    <button 
                        onClick={() => setListTab('contacted')}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${listTab === 'contacted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
                    >
                        Contatados ({savedLeads.filter(l => l.status === 'contacted').length})
                    </button>
                </div>
                <button onClick={fetchSavedLeads} className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <RefreshCcw size={16}/>
                </button>
             </div>

             <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                {loadingList ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-blue-500"/>
                        Carregando sua base...
                    </div>
                ) : filteredSavedLeads.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        Nenhum lead {listTab === 'new' ? 'novo' : 'contatado'} encontrado.
                    </div>
                ) : (
                    <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-5">Nome</th>
                            <th className="p-5">Contato</th>
                            <th className="p-5">Local</th>
                            <th className="p-5 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredSavedLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-5 font-medium text-white">{lead.nome}</td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-slate-200">{lead.telefone}</span>
                                        <a 
                                            href={`https://wa.me/${lead.telefone}`} 
                                            target="_blank" 
                                            className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                                            title="Abrir WhatsApp"
                                        >
                                            <MessageCircle size={14}/>
                                        </a>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 block">{lead.tipo}</span>
                                </td>
                                <td className="p-5 text-sm text-slate-400 max-w-xs truncate">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={12} className="text-slate-600"/>
                                        {lead.endereco}
                                    </div>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        {listTab === 'new' ? (
                                            <button 
                                                onClick={() => markAsContacted(lead.id)}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-green-900/20"
                                            >
                                                Marcar Contatado
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => markAsNew(lead.id)}
                                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all"
                                            >
                                                Voltar p/ Novos
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => deleteSavedLead(lead.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all"
                                            title="Excluir da Base"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                )}
             </div>
           </div>
        )}

      </div>
    </div>
  )
}