'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Loader2, Save, Check, Trash2, Search, Users, MessageCircle, 
  MapPin, RefreshCcw, FileText, Plus, X, ListChecks, ExternalLink
} from 'lucide-react'

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

interface Template {
  id: string
  title: string
  content: string
}

export default function HunterPage() {
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'search' | 'list' | 'templates'>('search')
  const [userId, setUserId] = useState<string>('')

  const [termo, setTermo] = useState('')
  const [cidade, setCidade] = useState('Belo Horizonte')
  const [searchResults, setSearchResults] = useState<GoogleLead[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedLeadsIndices, setSelectedLeadsIndices] = useState<number[]>([])

  const [savedLeads, setSavedLeads] = useState<DbLead[]>([])
  const [listTab, setListTab] = useState<'new' | 'contacted'>('new')
  const [loadingList, setLoadingList] = useState(false)

  const [templates, setTemplates] = useState<Template[]>([])
  const [newTemplTitle, setNewTemplTitle] = useState('')
  const [newTemplContent, setNewTemplContent] = useState('')
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [leadToContact, setLeadToContact] = useState<DbLead | null>(null)

  // Inicialização
  useEffect(() => {
    getUser()
    fetchSavedLeads() 
    fetchTemplates()
  }, [])

  const getUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (data.user) setUserId(data.user.id)
  }

  const searchLeads = async () => {
    setSearching(true)
    setSelectedLeadsIndices([])
    try {
      const res = await fetch('/api/hunter', { method: 'POST', body: JSON.stringify({ termo, cidade }) })
      const data = await res.json()
      
      const resultsWithStatus = (data.leads || []).map((lead: GoogleLead) => ({
        ...lead,
        saved: savedLeads.some(saved => saved.telefone === lead.telefone_api)
      }))
      
      setSearchResults(resultsWithStatus)
    } catch (error) { alert('Erro ao buscar') }
    setSearching(false)
  }

  const toggleSelectLead = (index: number) => {
    if (searchResults[index].saved) return;
    if (selectedLeadsIndices.includes(index)) {
      setSelectedLeadsIndices(prev => prev.filter(i => i !== index))
    } else {
      setSelectedLeadsIndices(prev => [...prev, index])
    }
  }

  const saveSingleLead = async (lead: GoogleLead, index: number) => {
    if (!userId) return;
    const { error } = await supabase.from('leads').insert({
      user_id: userId, nome: lead.nome, telefone: lead.telefone_api, 
      tipo: lead.tipo, endereco: lead.endereco, rating: lead.rating.toString(), status: 'new'
    })
    if (!error) {
      const newRes = [...searchResults]; newRes[index].saved = true; setSearchResults(newRes);
      fetchSavedLeads()
    }
  }

  const saveBulkLeads = async () => {
    if (!userId || selectedLeadsIndices.length === 0) return;
    const leadsToSave = selectedLeadsIndices.map(i => ({
      user_id: userId,
      nome: searchResults[i].nome,
      telefone: searchResults[i].telefone_api,
      tipo: searchResults[i].tipo,
      endereco: searchResults[i].endereco,
      rating: searchResults[i].rating.toString(),
      status: 'new'
    }))

    const { error } = await supabase.from('leads').insert(leadsToSave)
    if (error) alert('Erro ao salvar em massa')
    else {
      const newRes = [...searchResults]
      selectedLeadsIndices.forEach(i => newRes[i].saved = true)
      setSearchResults(newRes)
      setSelectedLeadsIndices([])
      fetchSavedLeads()
      alert(`${leadsToSave.length} leads salvos!`)
    }
  }

  const fetchSavedLeads = async () => {
    setLoadingList(true)
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (data) setSavedLeads(data as DbLead[])
    setLoadingList(false)
  }

  const deleteSavedLead = async (id: string) => {
    if (!confirm('Excluir este lead?')) return
    await supabase.from('leads').delete().eq('id', id)
    setSavedLeads(prev => prev.filter(l => l.id !== id))
  }

  const moveStatus = async (id: string, status: 'new' | 'contacted') => {
     await supabase.from('leads').update({ status }).eq('id', id)
     setSavedLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const fetchTemplates = async () => {
    const { data } = await supabase.from('message_templates').select('*').order('created_at', { ascending: false })
    if (data) setTemplates(data as Template[])
  }

  const handleSaveTemplate = async () => {
    if (!newTemplTitle || !newTemplContent || !userId) return
    const { data, error } = await supabase.from('message_templates').insert({
        user_id: userId, title: newTemplTitle, content: newTemplContent
    }).select().single()
    
    if (!error && data) {
        setTemplates([data, ...templates])
        setNewTemplTitle(''); setNewTemplContent('')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
      await supabase.from('message_templates').delete().eq('id', id)
      setTemplates(templates.filter(t => t.id !== id))
  }

  const openContactModal = (lead: DbLead) => {
      setLeadToContact(lead)
      setIsSendModalOpen(true)
  }

  const handleOpenWhatsApp = async (templateContent: string) => {
      if (!leadToContact) return;
      
      const firstName = leadToContact.nome.split(' ')[0] || ''
      const finalMsg = templateContent.replace('{nome}', firstName)

      const url = `https://wa.me/${leadToContact.telefone}?text=${encodeURIComponent(finalMsg)}`
      window.open(url, '_blank')

      await moveStatus(leadToContact.id, 'contacted')
      
      setIsSendModalOpen(false)
      setLeadToContact(null)
  }

  const filteredSavedLeads = savedLeads.filter(l => l.status === listTab)

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO E ABAS */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 flex items-center gap-3">
               Lead Hunter <span className="text-2xl">🕵️‍♂️</span>
            </h1>
            <p className="text-slate-400 mt-1">Sua máquina de prospecção.</p>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setActiveTab('search')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'search' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Search size={16}/> Buscar</button>
            <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'list' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Users size={16}/> Meus Leads</button>
            <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'templates' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><FileText size={16}/> Templates</button>
          </div>
        </div>

        {activeTab === 'search' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-4 mb-6 flex-col md:flex-row bg-slate-900/50 p-5 rounded-2xl border border-slate-800/50 shadow-xl">
              <input value={termo} onChange={e => setTermo(e.target.value)} placeholder="Nicho (Ex: Pizzaria)" className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-green-500 outline-none" />
              <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" className="w-full md:w-64 p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-green-500 outline-none" />
              <button onClick={searchLeads} disabled={searching} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]">{searching ? <Loader2 className="animate-spin" /> : <Search size={20}/>} Buscar</button>
            </div>

            {searchResults.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-xs text-slate-400">Encontrados: {searchResults.length}</span>
                    {selectedLeadsIndices.length > 0 && (
                        <button onClick={saveBulkLeads} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 animate-in slide-in-from-right-5"><ListChecks size={14}/> Salvar Selecionados ({selectedLeadsIndices.length})</button>
                    )}
                </div>
                <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                    <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-5 w-10 text-center">#</th>
                            <th className="p-5">Nome</th>
                            <th className="p-5">Contato</th>
                            <th className="p-5 text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {searchResults.map((lead, i) => (
                        <tr key={i} className={`hover:bg-slate-800/50 transition-colors ${lead.saved ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                            <td className="p-5 text-center">
                                <input type="checkbox" disabled={lead.saved} checked={selectedLeadsIndices.includes(i)} onChange={() => toggleSelectLead(i)} className="accent-blue-500 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"/>
                            </td>
                            <td className="p-5 font-medium text-white">{lead.nome}</td>
                            <td className="p-5">
                                <div className="flex flex-col">
                                    <span className="font-mono text-green-400">{lead.telefone_api}</span>
                                    <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded mt-1 font-bold ${lead.tipo === 'CELULAR' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-700 text-slate-400'}`}>{lead.tipo}</span>
                                </div>
                            </td>
                            <td className="p-5 text-center">
                                <button onClick={() => saveSingleLead(lead, i)} disabled={lead.saved} className={`p-2.5 rounded-lg transition-all ${lead.saved ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>{lead.saved ? <Check size={18} /> : <Save size={18} />}</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'list' && (
           <div className="animate-in fade-in slide-in-from-bottom-2">
             <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button onClick={() => setListTab('new')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${listTab === 'new' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}>Novos</button>
                    <button onClick={() => setListTab('contacted')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${listTab === 'contacted' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white'}`}>Contatados</button>
                </div>
                <button onClick={fetchSavedLeads} className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><RefreshCcw size={16}/></button>
             </div>

             <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                {loadingList ? <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2"><Loader2 className="animate-spin text-blue-500"/>Carregando...</div> : filteredSavedLeads.length === 0 ? <div className="p-12 text-center text-slate-500">Nenhum lead nesta lista.</div> : (
                    <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr><th className="p-5">Nome</th><th className="p-5">Contato</th><th className="p-5 text-right">Ações</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredSavedLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-5 font-medium text-white">{lead.nome}</td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2"><span className="font-mono text-slate-200">{lead.telefone}</span></div>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        {listTab === 'new' ? (
                                            <button onClick={() => openContactModal(lead)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-green-900/20"><MessageCircle size={14}/> Contatar</button>
                                        ) : (
                                            <button onClick={() => moveStatus(lead.id, 'new')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold">Voltar</button>
                                        )}
                                        <button onClick={() => deleteSavedLead(lead.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg"><Trash2 size={16}/></button>
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

        {activeTab === 'templates' && (
             <div className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-fit">
                    <h3 className="font-bold text-lg mb-4 text-white">Novo Template</h3>
                    <div className="space-y-4">
                        <input value={newTemplTitle} onChange={e => setNewTemplTitle(e.target.value)} placeholder="Título (Ex: Proposta Inicial)" className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-blue-500 text-sm"/>
                        <textarea value={newTemplContent} onChange={e => setNewTemplContent(e.target.value)} placeholder="Mensagem... Use {nome} para substituir pelo nome do lead." rows={6} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-blue-500 text-sm resize-none"/>
                        <button onClick={handleSaveTemplate} disabled={!newTemplTitle || !newTemplContent} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-50">Salvar Template</button>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg text-white">Meus Templates</h3>
                    {templates.length === 0 ? <div className="text-slate-500 italic">Nenhum template criado.</div> : templates.map(t => (
                        <div key={t.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex justify-between items-start group hover:border-blue-500/30 transition-all">
                            <div>
                                <h4 className="font-bold text-blue-400 mb-1">{t.title}</h4>
                                <p className="text-slate-400 text-sm whitespace-pre-wrap">{t.content}</p>
                            </div>
                            <button onClick={() => handleDeleteTemplate(t.id)} className="text-slate-600 hover:text-red-400 p-2"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
             </div>
        )}

      </div>

      {isSendModalOpen && leadToContact && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                 <button onClick={() => setIsSendModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                 <h3 className="text-xl font-bold text-white mb-1">Contatar {leadToContact.nome}</h3>
                 <p className="text-slate-500 text-sm mb-6">Selecione o template para abrir no WhatsApp.</p>
                 
                 <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar mb-4">
                     {templates.length === 0 && <p className="text-red-400 text-xs">Crie templates na aba "Templates" primeiro.</p>}
                     {templates.map(t => (
                         <button key={t.id} onClick={() => handleOpenWhatsApp(t.content)} className="w-full text-left p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-green-500 hover:bg-green-500/5 transition-all group">
                             <div className="flex justify-between items-center mb-1">
                                 <div className="font-bold text-slate-300 group-hover:text-green-400 text-sm">{t.title}</div>
                                 <ExternalLink size={12} className="text-slate-600 group-hover:text-green-500"/>
                             </div>
                             <div className="text-slate-500 text-xs truncate">{t.content}</div>
                         </button>
                     ))}
                 </div>
             </div>
         </div>
      )}

    </div>
  )
}