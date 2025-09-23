import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setUser, setProfile, setLoading, setError, clearAuth } from '../store/slices/authSlice'
import { RootState } from '../store/store'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, profile, loading, error } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    let mounted = true
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      
      if (error) {
        console.error('Session error:', error)
        // Clear invalid session
        localStorage.clear()
        dispatch(clearAuth())
        return
      }
      
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
      if (!mounted) return
      
      if (event === 'TOKEN_REFRESHED' && !session) {
        // Handle invalid refresh token
        localStorage.clear()
        dispatch(clearAuth())
        return
      }
      
      dispatch(setUser(session?.user || null))
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        dispatch(clearAuth())
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [dispatch])

  const fetchProfile = async (userId: string) => {
    try {
      // Ensure profile exists first
      await supabase.rpc('ensure_user_profile_exists', { user_id: userId })
      
      // Ensure profile exists first
      await supabase.rpc('ensure_user_profile_exists', { user_id: userId })
      
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
      console.error('Profile fetch error:', error)
      dispatch(setError(error.message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const signIn = async (email: string, password: string) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        dispatch(setError(error.message))
      }
    } catch (error: any) {
      dispatch(setError(error.message))
    }
    
    dispatch(setLoading(false))
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
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
        // Show success message for email confirmation
        dispatch(setError('Account created successfully! You can now sign in.'))
      }
    } catch (error: any) {
      dispatch(setError(error.message))
    }
    
    dispatch(setLoading(false))
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
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
  
  const updateProfile = async (updates: { full_name?: string; email?: string }) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle()
      
      if (error) throw error
      
      dispatch(setProfile(data))
      return data
    } catch (error: any) {
      throw error
    }
  }
  
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
    } catch (error: any) {
      throw error
    }
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
    updateProfile,
    updatePassword,
  }
}