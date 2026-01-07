import Link from 'next/link'
import { Search, MessageSquare, Settings } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="mb-12 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-400">Zytech Hub</h1>
        <div className="text-slate-400 text-sm">Bem-vindo, Admin</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/hunter" className="group">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-green-500 transition h-48 flex flex-col justify-between">
            <div className="p-3 bg-slate-800 w-fit rounded-lg group-hover:bg-green-900/30 text-green-400">
              <Search size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Lead Hunter</h2>
              <p className="text-slate-400 text-sm">Busque e salve contatos do Google Maps.</p>
            </div>
          </div>
        </Link>

        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl h-48 flex flex-col justify-between opacity-50 cursor-not-allowed">
          <div className="p-3 bg-slate-800 w-fit rounded-lg text-slate-500">
            <MessageSquare size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Bot Manager</h2>
            <p className="text-slate-400 text-sm">Em breve...</p>
          </div>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl h-48 flex flex-col justify-between opacity-50 cursor-not-allowed">
          <div className="p-3 bg-slate-800 w-fit rounded-lg text-slate-500">
            <Settings size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Configurações</h2>
            <p className="text-slate-400 text-sm">Em breve...</p>
          </div>
        </div>
      </div>
    </div>
  )
}