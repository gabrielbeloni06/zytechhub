'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else router.push('/dashboard/hunter') 
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center font-sans text-white">
      
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src="/a.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none" />

      <div 
        className={`relative z-20 w-full max-w-md p-8 transition-all duration-1000 ease-out transform ${
          showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl ring-1 ring-white/5">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Zytech</h1>
            <p className="text-zinc-400 text-sm">Acesse sua central de inteligência.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                placeholder="nome@empresa.com"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3.5 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20}/> : (
                <>Entrar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}