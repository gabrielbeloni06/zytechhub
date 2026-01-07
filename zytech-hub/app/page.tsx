'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setCheckingSession(false)
      }
    }
    checkUser()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert('Erro: ' + error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-green-500" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-green-500 to-blue-600"></div>

      <div className="w-full max-w-md p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Lock size={100} />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Zytech Hub</h1>
          <p className="text-slate-400 mb-8 text-sm">Acesso restrito à diretoria.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email Corporativo</label>
              <input
                type="email"
                className="w-full p-3 bg-slate-950 rounded-lg border border-slate-800 focus:border-green-500 focus:bg-slate-900 outline-none transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Senha de Acesso</label>
              <input
                type="password"
                className="w-full p-3 bg-slate-950 rounded-lg border border-slate-800 focus:border-green-500 focus:bg-slate-900 outline-none transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-3 mt-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:shadow-[0_0_30px_rgba(22,163,74,0.4)]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Acessar Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}