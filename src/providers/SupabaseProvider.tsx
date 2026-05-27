'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/src/lib/supabase/client'

// ----------------------------------------------------------------
// Context shape
// ----------------------------------------------------------------
interface SupabaseContextValue {
  supabase: SupabaseClient
  session: Session | null
  user: User | null
  /** True while the initial session is being loaded */
  loading: boolean
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined
)

// ----------------------------------------------------------------
// Provider
// ----------------------------------------------------------------
export default function SupabaseProvider({
  children,
}: {
  children: ReactNode
}) {
  // Create the browser client once for the lifetime of the app
  const [supabase] = useState(() => createClient())
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <SupabaseContext.Provider value={{ supabase, session, user, loading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

// ----------------------------------------------------------------
// Hook
// ----------------------------------------------------------------
export function useSupabase(): SupabaseContextValue {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
