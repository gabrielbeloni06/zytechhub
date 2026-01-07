'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, TrendingUp, Activity, 
  ArrowUpRight, Target, Globe, ShieldCheck, 
  Plus, Search, DollarSign
} from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('')
  const [userName, setUserName] = useState('')
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalClients: 0,
    totalLeads: 0,
    activeBots: 0
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('role, name').eq('id', user.id).single()
      setRole(profile?.role || 'user')
      setUserName(profile?.name || 'Admin')

      
      const { data: orgs } = await supabase.from('organizations').select('subscription_value, status, bot_status')
      const revenue = orgs?.reduce((acc, curr) => acc + (curr.subscription_value || 0), 0) || 0
      const activeClients = orgs?.filter(o => o.status === 'active').length || 0
      const bots = orgs?.filter(o => o.bot_status === true).length || 0

      const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })

      setStats({
        totalRevenue: revenue,
        totalClients: activeClients,
        totalLeads: leadsCount || 0,
        activeBots: bots
      })

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const KpiCard = ({ title, value, sub, icon: Icon }: any) => (
    <div className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl transition-all duration-500 hover:bg-white/5 hover:border-white/20">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={64} className="text-white"/>
      </div>
      <div className="relative z-10">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{title}</p>
        <h3 className="text-4xl font-bold text-white tracking-tighter mb-1">{value}</h3>
        <p className="text-xs text-zinc-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse"></span> {sub}
        </p>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden">
      
      <video autoPlay muted loop playsInline className="fixed inset-0 w-full h-full object-cover z-0 opacity-30 grayscale">
        <source src="/video2.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-gradient-to-t from-black via-black/90 to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-white mb-2">Command Center</h1>
            <p className="text-zinc-400 text-sm tracking-wide">Bem-vindo de volta, <span className="text-white font-bold">{userName}</span>.</p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-xs font-bold text-zinc-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                SISTEMA ONLINE
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <KpiCard 
            title="Receita Mensal (MRR)" 
            value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`} 
            sub="Faturamento Recorrente" 
            icon={DollarSign}
          />
          <KpiCard 
            title="Clientes Ativos" 
            value={stats.totalClients} 
            sub="Empresas na Base" 
            icon={Users}
          />
          <KpiCard 
            title="Leads Capturados" 
            value={stats.totalLeads} 
            sub="Base do Hunter" 
            icon={Target}
          />
          <KpiCard 
            title="IA Operando" 
            value={stats.activeBots} 
            sub="Bots Conectados" 
            icon={Activity}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* GRÁFICO (Simulado Visualmente para combinar com o tema) */}
            <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between min-h-[400px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-0"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Performance Global</h3>
                        <p className="text-zinc-500 text-xs">Crescimento nos últimos 6 meses</p>
                    </div>
                    <button className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"><ArrowUpRight size={20}/></button>
                </div>

                <div className="relative z-10 h-64 flex items-end gap-2 mt-8">
                    {[35, 45, 30, 60, 55, 75, 80, 65, 90, 85, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/5 hover:bg-white/20 transition-all duration-500 rounded-t-sm relative group/bar">
                            <div style={{ height: `${h}%` }} className="w-full bg-white opacity-10 group-hover/bar:opacity-100 transition-all duration-500 relative">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">{h}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/10 h-full flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white mb-2">Acesso Rápido</h3>
                    
                    <Link href="/dashboard/hunter" className="group w-full p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white/5 text-white group-hover:scale-110 transition-transform"><Search size={20}/></div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Lead Hunter</h4>
                                <p className="text-[10px] text-zinc-500">Prospectar novos clientes</p>
                            </div>
                        </div>
                        <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-white"/>
                    </Link>

                    <Link href="/dashboard/clients" className="group w-full p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white/5 text-white group-hover:scale-110 transition-transform"><Users size={20}/></div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Gerir Clientes</h4>
                                <p className="text-[10px] text-zinc-500">Ver base de contratos</p>
                            </div>
                        </div>
                        <ArrowUpRight size={16} className="text-zinc-600 group-hover:text-white"/>
                    </Link>

                    <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                            <span>Segurança</span>
                            <span className="text-green-500 flex items-center gap-1"><ShieldCheck size={12}/> Protegido</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1">
                            <div className="bg-white w-[80%] h-1 rounded-full opacity-20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}