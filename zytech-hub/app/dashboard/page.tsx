import Link from 'next/link'
import { Search, MessageSquare, Settings, LogOut, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-green-500/30">
      
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">Z</div>
            <span className="font-bold tracking-tight">Zytech Hub</span>
          </div>
          <button className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            Sair <LogOut size={14}/>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Painel de Controle</h1>
          <p className="text-slate-400">Selecione uma ferramenta para começar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Link href="/dashboard/hunter" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>
            <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                  <Search size={24} />
                </div>
                <h2 className="text-xl font-bold mb-2">Lead Hunter</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Ferramenta de prospecção. Busque imobiliárias e comércios no Google Maps e salve no banco.
                </p>
              </div>
              <div className="mt-6 flex items-center text-green-400 text-sm font-bold gap-2">
                Acessar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </div>
            </div>
          </Link>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col justify-between opacity-60">
            <div>
              <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-500 mb-4">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-500">Bot Manager</h2>
              <p className="text-slate-600 text-sm">
                Gerenciamento de instâncias e fluxos do WhatsApp.
              </p>
            </div>
            <div className="mt-6 text-xs font-bold text-slate-600 bg-slate-800/50 w-fit px-2 py-1 rounded border border-slate-700">EM BREVE</div>
          </div>

        </div>
      </main>
    </div>
  )
}