'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from '@remix-run/react'
import { createClient } from '~/utils/supabase.client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Mail, Apple } from 'lucide-react'

interface AuthComponentProps {
  onClose: () => void
}

export default function AuthComponent({ onClose }: AuthComponentProps = { onClose: () => {} }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const navigate = useNavigate()

  useEffect(() => {
    const client = createClient()
    if (client) {
      setSupabase(client)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        onClose()
        navigate('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, navigate, onClose])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setError('Please check your email for the confirmation link.')
    }

    setLoading(false)
  }

  const handleOAuthSignIn = async (provider: 'github' | 'google' | 'apple') => {
    if (!supabase) return

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  if (!supabase) {
    return <div className="text-center text-gray-300">Loading...</div>
  }

  return (
    <div className="w-full max-w-md p-8 bg-[#0E1117] rounded-lg shadow-lg">
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 text-lg font-semibold transition-colors duration-300 bg-transparent ${
            activeTab === 'signin' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-2 text-lg font-semibold transition-colors duration-300 bg-transparent ${
            activeTab === 'signup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C2128] text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C2128] text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <motion.button
            type="submit"
            className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition-colors duration-300"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Processing...' : activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </motion.form>
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mt-4 text-center"
        >
          {error}
        </motion.p>
      )}

      <div className="mt-8">
        <p className="text-center mb-4 text-gray-400">Or continue with</p>
        <div className="flex justify-center space-x-4">
          <motion.button
            onClick={() => handleOAuthSignIn('github')}
            className="p-2 bg-[#1C2128] rounded-full hover:bg-[#2D3748] transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Github className="w-6 h-6 text-white" />
          </motion.button>
          <motion.button
            onClick={() => handleOAuthSignIn('google')}
            className="p-2 bg-[#1C2128] rounded-full hover:bg-[#2D3748] transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Mail className="w-6 h-6 text-white" />
          </motion.button>
          <motion.button
            onClick={() => handleOAuthSignIn('apple')}
            className="p-2 bg-[#1C2128] rounded-full hover:bg-[#2D3748] transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Apple className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}