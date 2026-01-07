'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, Check } from 'lucide-react'

interface Lead {
  nome: string
  telefone_api: string
  tipo: string
  endereco: string
  rating: number
  saved?: boolean 
}

export default function HunterPage() {
  const [termo, setTermo] = useState('')
  const [cidade, setCidade] = useState('Belo Horizonte')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const searchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hunter', {
        method: 'POST',
        body: JSON.stringify({ termo, cidade }),
      })
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (error) {
      alert('Erro ao buscar')
    }
    setLoading(false)
  }

  const saveLead = async (lead: Lead, index: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Faça login novamente')

    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      nome: lead.nome,
      telefone: lead.telefone_api,
      tipo: lead.tipo,
      endereco: lead.endereco,
      rating: lead.rating.toString()
    })

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      const newLeads = [...leads]
      newLeads[index].saved = true
      setLeads(newLeads)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-green-400">Lead Hunter 🕵️‍♂️</h1>
            <p className="text-slate-400">Busque no Google e salve na sua base Zytech.</p>
        </div>

        <div className="flex gap-4 mb-8 flex-col md:flex-row bg-slate-900 p-4 rounded-lg">
          <input 
            value={termo}
            onChange={e => setTermo(e.target.value)}
            placeholder="Ex: Imobiliária, Pizzaria..." 
            className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 focus:border-green-500 outline-none"
          />
          <input 
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            placeholder="Cidade" 
            className="w-full md:w-48 p-3 rounded bg-slate-800 border border-slate-700 outline-none"
          />
          <button 
            onClick={searchLeads}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Buscar Leads'}
          </button>
        </div>

        {leads.length > 0 && (
          <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-800 text-green-400">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4 font-medium">{lead.nome}</td>
                    <td className="p-4 font-mono">{lead.telefone_api}</td>
                    <td className="p-4">
                       <span className={`text-xs px-2 py-1 rounded ${lead.tipo === 'CELULAR' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                          {lead.tipo}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => saveLead(lead, i)}
                        disabled={lead.saved}
                        className={`p-2 rounded transition ${lead.saved ? 'bg-slate-700 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
    </div>
  )
}