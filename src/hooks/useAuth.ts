import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setUser, setProfile, setLoading, setError, clearAuth } from '../store/slices/authSlice'
import { RootState } from '../store/store'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, profile, loading, error } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user || null))
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        dispatch(setLoading(false))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      dispatch(setUser(session?.user || null))
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        dispatch(clearAuth())
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        dispatch(setError(error.message))
      } else {
        dispatch(setProfile(data))
      }
    } catch (error: any) {
      dispatch(setError(error.message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const signIn = async (email: string, password: string) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      dispatch(setError(error.message))
    }
    dispatch(setLoading(false))
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    
    if (error) {
      dispatch(setError(error.message))
    } else if (data.user && !data.user.email_confirmed_at) {
      // For email confirmation flow, show success message
      dispatch(setError('Please check your email and click the confirmation link to complete your registration.'))
    }
    
    dispatch(setLoading(false))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    dispatch(clearAuth())
  }

  const resendConfirmation = async (email: string) => {
    dispatch(setLoading(true))
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    
    if (error) {
      dispatch(setError(error.message))
    } else {
      dispatch(setError('Confirmation email sent! Please check your inbox.'))
    }
    dispatch(setLoading(false))
  }
  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resendConfirmation,
  }
}