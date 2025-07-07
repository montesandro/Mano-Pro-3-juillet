import { create } from 'zustand'
import { AuthState, User, transformDatabaseUser } from '../types'
import { supabase, getUserProfile } from '../lib/supabase'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>
  updateUser: (userData: Partial<User>) => Promise<boolean>
  setUser: (user: User | null) => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      console.error('Login error:', authError)
      set({ isLoading: false })
      return false
    }

    try {
      const userProfile = await getUserProfile(authData.user.id)
      const user = transformDatabaseUser(userProfile)

      set({ user, isAuthenticated: true, isLoading: false })
      localStorage.setItem('mano-pro-user', JSON.stringify(user))
      return true
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ isLoading: false })
      return false
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }

    set({ user: null, isAuthenticated: false })
    localStorage.removeItem('mano-pro-user')
  },

  register: async (userData) => {
    set({ isLoading: true })

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password
      })

      if (authError || !authData.user) {
        console.error('Erreur création auth.user :', authError)
        set({ isLoading: false })
        return false
      }

      const userId = authData.user.id

      // ✅ Version minimale volontaire pour tester l'insertion
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userData.email!,
          role: userData.role!,
          created_at: new Date().toISOString()
        })

      console.log('Résultat upsert users:', dbError)

      if (dbError) {
        console.error('Erreur insertion users :', dbError)
        await supabase.auth.signOut()
        set({ isLoading: false })
        return false
      }

      const userProfile = await getUserProfile(userId)
      const user = transformDatabaseUser(userProfile)

      set({ user, isAuthenticated: true, isLoading: false })
      localStorage.setItem('mano-pro-user', JSON.stringify(user))
      return true

    } catch (error) {
      console.error('Erreur générale inscription :', error)
      set({ isLoading: false })
      return false
    }
  },

  updateUser: async (userData) => {
    set({ isLoading: true })
    const currentUser = get().user
    if (!currentUser) {
      set({ isLoading: false })
      return false
    }

    try {
      const updateData: any = {}

      if (userData.firstName) updateData.first_name = userData.firstName
      if (userData.lastName) updateData.last_name = userData.lastName
      if (userData.phone) updateData.phone = userData.phone
      if (userData.company) updateData.company = userData.company
      if (userData.arrondissements) updateData.arrondissements = userData.arrondissements
      if (userData.trades) updateData.trades = userData.trades
      if (userData.bankDetails) {
        updateData.bank_details_iban = userData.bankDetails.iban
        updateData.bank_details_bic = userData.bankDetails.bic
        updateData.bank_details_account_holder = userData.bankDetails.accountHolder
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id)

      if (error) {
        console.error('Update error:', error)
        set({ isLoading: false })
        return false
      }

      const updatedUser = { ...currentUser, ...userData }
      set({ user: updatedUser, isLoading: false })
      localStorage.setItem('mano-pro-user', JSON.stringify(updatedUser))
      return true

    } catch (error) {
      console.error('Update error:', error)
      set({ isLoading: false })
      return false
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const userProfile = await getUserProfile(session.user.id)
        const user = transformDatabaseUser(userProfile)
        set({ user, isAuthenticated: true })
        localStorage.setItem('mano-pro-user', JSON.stringify(user))
      }
    } catch (error) {
      console.error('Init auth error:', error)
      localStorage.removeItem('mano-pro-user')
      set({ user: null, isAuthenticated: false })
    }
  }
}))

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    useAuthStore.getState().setUser(null)
    localStorage.removeItem('mano-pro-user')
  }
})
