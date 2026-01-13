'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Loader2, Save, Check, Trash2, Search, Users, MessageCircle, 
  MapPin, RefreshCcw, FileText, Plus, X, ListChecks, ExternalLink, Star, Filter
} from 'lucide-react'

interface GoogleLead {
  nome: string; telefone_api: string; tipo: string; endereco: string; rating: number; saved?: boolean 
}
interface DbLead {
  id: string; nome: string; telefone: string; tipo: string; endereco: string; rating: string; status: 'new' | 'contacted'; created_at: string
}
interface Template {
  id: string; title: string; content: string
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

  useEffect(() => { getUser(); fetchSavedLeads(); fetchTemplates() }, [])
  const getUser = async () => { const { data } = await supabase.auth.getUser(); if (data.user) setUserId(data.user.id) }
  
  const searchLeads = async () => {
    setSearching(true); setSelectedLeadsIndices([])
    try {
      const res = await fetch('/api/hunter', { method: 'POST', body: JSON.stringify({ termo, cidade }) })
      const data = await res.json()
      const resultsWithStatus = (data.leads || []).map((lead: GoogleLead) => ({ ...lead, saved: savedLeads.some(saved => saved.telefone === lead.telefone_api) }))
      setSearchResults(resultsWithStatus)
    } catch (error) { alert('Erro ao buscar') }
    setSearching(false)
  }

  const toggleSelectLead = (index: number) => {
    if (searchResults[index].saved) return;
    if (selectedLeadsIndices.includes(index)) setSelectedLeadsIndices(prev => prev.filter(i => i !== index))
    else setSelectedLeadsIndices(prev => [...prev, index])
  }

  const saveSingleLead = async (lead: GoogleLead, index: number) => {
    if (!userId) return;
    const { error } = await supabase.from('leads').insert({ user_id: userId, nome: lead.nome, telefone: lead.telefone_api, tipo: lead.tipo, endereco: lead.endereco, rating: lead.rating.toString(), status: 'new' })
    if (!error) { const newRes = [...searchResults]; newRes[index].saved = true; setSearchResults(newRes); fetchSavedLeads() }
  }

  const saveBulkLeads = async () => {
    if (!userId || selectedLeadsIndices.length === 0) return;
    const leadsToSave = selectedLeadsIndices.map(i => ({ user_id: userId, nome: searchResults[i].nome, telefone: searchResults[i].telefone_api, tipo: searchResults[i].tipo, endereco: searchResults[i].endereco, rating: searchResults[i].rating.toString(), status: 'new' }))
    const { error } = await supabase.from('leads').insert(leadsToSave)
    if (!error) { const newRes = [...searchResults]; selectedLeadsIndices.forEach(i => newRes[i].saved = true); setSearchResults(newRes); setSelectedLeadsIndices([]); fetchSavedLeads(); alert(`${leadsToSave.length} salvos!`) }
  }

  const fetchSavedLeads = async () => { setLoadingList(true); const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false }); if (data) setSavedLeads(data as DbLead[]); setLoadingList(false) }
  const deleteSavedLead = async (id: string) => { if (!confirm('Excluir?')) return; await supabase.from('leads').delete().eq('id', id); setSavedLeads(prev => prev.filter(l => l.id !== id)) }
  const moveStatus = async (id: string, status: 'new' | 'contacted') => { await supabase.from('leads').update({ status }).eq('id', id); setSavedLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l)) }
  
  const fetchTemplates = async () => { const { data } = await supabase.from('message_templates').select('*').order('created_at', { ascending: false }); if (data) setTemplates(data as Template[]) }
  const handleSaveTemplate = async () => { if (!newTemplTitle || !newTemplContent || !userId) return; const { data, error } = await supabase.from('message_templates').insert({ user_id: userId, title: newTemplTitle, content: newTemplContent }).select().single(); if (!error && data) { setTemplates([data, ...templates]); setNewTemplTitle(''); setNewTemplContent('') } }
  const handleDeleteTemplate = async (id: string) => { await supabase.from('message_templates').delete().eq('id', id); setTemplates(templates.filter(t => t.id !== id)) }
  const openContactModal = (lead: DbLead) => { setLeadToContact(lead); setIsSendModalOpen(true) }
  const handleOpenWhatsApp = async (templateContent: string) => { if (!leadToContact) return; const firstName = leadToContact.nome.split(' ')[0] || ''; const finalMsg = templateContent.replace('{nome}', firstName); window.open(`https://wa.me/${leadToContact.telefone}?text=${encodeURIComponent(finalMsg)}`, '_blank'); await moveStatus(leadToContact.id, 'contacted'); setIsSendModalOpen(false); setLeadToContact(null) }

  const filteredSavedLeads = savedLeads.filter(l => l.status === listTab)

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-white/20">
      
      <video autoPlay muted loop playsInline className="fixed inset-0 w-full h-full object-cover z-0 opacity-40 grayscale">
        <source src="/video2.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-gradient-to-b from-black via-black/80 to-black z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 space-y-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end pb-4 border-b border-white/10 backdrop-blur-sm">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-white mb-2">Lead Hunter</h1>
            <p className="text-zinc-400 text-sm tracking-wide">PROSPECÇÃO DE ALTA PERFORMANCE</p>
          </div>
          
          <div className="flex gap-2 bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10">
            {[
              { id: 'search', label: 'Buscar', icon: Search },
              { id: 'list', label: 'Meus Leads', icon: Users },
              { id: 'templates', label: 'Templates', icon: FileText }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'search' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* SEARCH BAR GRANDE */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl mb-8">
              <div className="flex-1 flex items-center bg-white/5 rounded-xl px-4 border border-white/5 focus-within:border-white/20 transition-colors">
                <Search className="text-zinc-500" size={18} />
                <input 
                  value={termo} onChange={e => setTermo(e.target.value)} 
                  placeholder="Nicho (ex: Clínicas de Estética)" 
                  className="w-full bg-transparent p-4 text-white placeholder:text-zinc-600 outline-none text-lg"
                />
              </div>
              <div className="md:w-1/3 flex items-center bg-white/5 rounded-xl px-4 border border-white/5 focus-within:border-white/20 transition-colors">
                <MapPin className="text-zinc-500" size={18} />
                <input 
                  value={cidade} onChange={e => setCidade(e.target.value)} 
                  placeholder="Localização" 
                  className="w-full bg-transparent p-4 text-white placeholder:text-zinc-600 outline-none text-lg"
                />
              </div>
              <button 
                onClick={searchLeads} disabled={searching}
                className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50"
              >
                {searching ? <Loader2 className="animate-spin" /> : "BUSCAR"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{searchResults.length} Resultados</span>
                    {selectedLeadsIndices.length > 0 && (
                        <button onClick={saveBulkLeads} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10 animate-pulse">
                          <ListChecks size={14}/> Salvar ({selectedLeadsIndices.length})
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((lead, i) => (
                    <div 
                      key={i} 
                      className={`group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/30 hover:bg-white/5 ${lead.saved ? 'opacity-40 grayscale' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" disabled={lead.saved} checked={selectedLeadsIndices.includes(i)} onChange={() => toggleSelectLead(i)} className="accent-white w-4 h-4 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" />
                          <div className={`text-[10px] font-bold px-2 py-1 rounded border ${lead.tipo === 'CELULAR' ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-600 border-zinc-800'}`}>
                            {lead.tipo}
                          </div>
                        </div>
                        <button onClick={() => saveSingleLead(lead, i)} disabled={lead.saved} className={`p-2 rounded-full border transition-all ${lead.saved ? 'border-zinc-800 text-zinc-600' : 'border-white/20 text-white hover:bg-white hover:text-black'}`}>
                          {lead.saved ? <Check size={14} /> : <Save size={14} />}
                        </button>
                      </div>

                      <h3 className="font-bold text-xl text-white mb-1 truncate">{lead.nome}</h3>
                      <p className="text-zinc-400 text-sm mb-4 font-mono">{lead.telefone_api}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-zinc-500 border-t border-white/5 pt-4">
                        <Star size={12} className="text-yellow-500/50" /> {lead.rating}
                        <span className="mx-2">•</span>
                        <span className="truncate">{lead.endereco}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'list' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button onClick={() => setListTab('new')} className={`text-2xl font-bold transition-colors ${listTab === 'new' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>Novos</button>
                    <button onClick={() => setListTab('contacted')} className={`text-2xl font-bold transition-colors ${listTab === 'contacted' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>Contatados</button>
                </div>
                <button onClick={fetchSavedLeads} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><RefreshCcw size={18}/></button>
             </div>

             <div className="space-y-2">
                {loadingList ? <div className="text-center text-zinc-600 py-20">Carregando base de dados...</div> : filteredSavedLeads.length === 0 ? <div className="text-center text-zinc-600 py-20 italic">A lista está vazia.</div> : (
                    filteredSavedLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between bg-black/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-zinc-500 font-bold">
                            {lead.nome.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">{lead.nome}</h4>
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                              <span className="font-mono text-zinc-300">{lead.telefone}</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/5 bg-white/5 uppercase text-[9px]">{lead.tipo}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                           {listTab === 'new' ? (
                              <button onClick={() => openContactModal(lead)} className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2">
                                <MessageCircle size={16}/> CONTATAR
                              </button>
                           ) : (
                              <button onClick={() => moveStatus(lead.id, 'new')} className="px-5 py-2.5 border border-white/10 text-zinc-400 hover:text-white font-bold text-xs rounded-xl hover:bg-white/5 transition-all">
                                Voltar
                              </button>
                           )}
                           <button onClick={() => deleteSavedLead(lead.id)} className="p-2.5 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))
                )}
             </div>
           </div>
        )}

        {activeTab === 'templates' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 h-fit">
                    <h3 className="font-bold text-xl mb-6 text-white">Criar Template</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Título</label>
                          <input value={newTemplTitle} onChange={e => setNewTemplTitle(e.target.value)} placeholder="Ex: Primeiro Contato" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30 text-white placeholder:text-zinc-700 transition-colors"/>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Mensagem</label>
                          <textarea value={newTemplContent} onChange={e => setNewTemplContent(e.target.value)} placeholder="Olá {nome}, tudo bem?..." rows={6} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30 text-white placeholder:text-zinc-700 transition-colors resize-none"/>
                        </div>
                        <button onClick={handleSaveTemplate} disabled={!newTemplTitle || !newTemplContent} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50">Salvar Modelo</button>
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.length === 0 && <div className="col-span-full text-center text-zinc-600 py-20 border border-dashed border-white/10 rounded-3xl">Nenhum template criado.</div>}
                    {templates.map(t => (
                        <div key={t.id} className="bg-black/20 border border-white/10 p-6 rounded-3xl flex flex-col justify-between group hover:border-white/30 transition-all hover:bg-white/5">
                            <div>
                                <h4 className="font-bold text-white mb-2 text-lg">{t.title}</h4>
                                <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">{t.content}</p>
                            </div>
                            <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                                <button onClick={() => handleDeleteTemplate(t.id)} className="text-zinc-600 hover:text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">Excluir <Trash2 size={12}/></button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

      </div>

      {isSendModalOpen && leadToContact && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
             <div className="bg-zinc-900/90 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                 <button onClick={() => setIsSendModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
                 
                 <h3 className="text-2xl font-bold text-white mb-2">Contatar Lead</h3>
                 <p className="text-zinc-400 text-sm mb-8">Escolha a abordagem para <span className="text-white font-bold">{leadToContact.nome}</span></p>
                 
                 <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                     {templates.length === 0 && <p className="text-zinc-500 text-center py-4">Nenhum template disponível.</p>}
                     {templates.map(t => (
                         <button key={t.id} onClick={() => handleOpenWhatsApp(t.content)} className="w-full text-left p-5 rounded-2xl bg-black/50 border border-white/5 hover:border-white/30 hover:bg-white/10 transition-all group">
                             <div className="flex justify-between items-center mb-1">
                                 <div className="font-bold text-white group-hover:text-white text-sm">{t.title}</div>
                                 <ExternalLink size={14} className="text-zinc-600 group-hover:text-white transition-colors"/>
                             </div>
                             <div className="text-zinc-500 text-xs truncate group-hover:text-zinc-300">{t.content}</div>
                         </button>
                     ))}
                 </div>
             </div>
         </div>
      )}
    </div>
  )
}