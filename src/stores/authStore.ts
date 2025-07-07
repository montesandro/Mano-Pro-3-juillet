// Authentication store using Zustand with Supabase integration
// Manages user authentication state and real database operations

import { create } from 'zustand';
import { AuthState, User, transformDatabaseUser } from '../types';
import { supabase, handleSupabaseError, getUserProfile } from '../lib/supabase';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Login error:', authError);
        set({ isLoading: false });
        return false;
      }

      if (!authData.user) {
        set({ isLoading: false });
        return false;
      }

      // Get user profile from users table
      try {
        const userProfile = await getUserProfile(authData.user.id);
        
        // Transform database fields to application format using utility function
        const user = transformDatabaseUser(userProfile);

        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        localStorage.setItem('mano-pro-user', JSON.stringify(user));
        return true;
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('mano-pro-user');
  },

register: async (userData) => {
  set({ isLoading: true });

  try {
    // 1. Crée le compte dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email!,
      password: userData.password
    });

    if (authError || !authData.user) {
      console.error('Erreur création auth.user :', authError);
      set({ isLoading: false });
      return false;
    }

    const userId = authData.user.id;

    // 2. Enregistre les infos dans ta table `users`
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userData.email!,
        first_name: userData.firstName!,
        last_name: userData.lastName!,
        phone: userData.phone!,
        company: userData.company!,
        role: userData.role!,
        is_verified: false,
        is_certified: userData.role === 'artisan' ? false : null,
        created_at: new Date().toISOString(),
        arrondissements: userData.arrondissements || [],
        trades: userData.trades || [],
        completed_projects: 0
      });

    if (dbError) {
      console.error('Erreur insertion dans `users` :', dbError);
      await supabase.auth.signOut(); // rollback de l'auth si erreur
      set({ isLoading: false });
      return false;
    }

    // 3. Récupère le profil à jour depuis la base
    const userProfile = await getUserProfile(userId);
    const user = transformDatabaseUser(userProfile);

    // 4. Mets à jour le state local
    set({
      user,
      isAuthenticated: true,
      isLoading: false
    });

    localStorage.setItem('mano-pro-user', JSON.stringify(user));
    return true;

  } catch (error) {
    console.error('Erreur générale register :', error);
    set({ isLoading: false });
    return false;
  }
},


  updateUser: async (userData) => {
    set({ isLoading: true });
    
    const currentUser = get().user;
    if (!currentUser) {
      set({ isLoading: false });
      return false;
    }
    
    try {
      // Prepare update data with database field names
      const updateData: any = {};
      
      if (userData.firstName) updateData.first_name = userData.firstName;
      if (userData.lastName) updateData.last_name = userData.lastName;
      if (userData.phone) updateData.phone = userData.phone;
      if (userData.company) updateData.company = userData.company;
      if (userData.arrondissements) updateData.arrondissements = userData.arrondissements;
      if (userData.trades) updateData.trades = userData.trades;
      if (userData.bankDetails) {
        updateData.bank_details_iban = userData.bankDetails.iban;
        updateData.bank_details_bic = userData.bankDetails.bic;
        updateData.bank_details_account_holder = userData.bankDetails.accountHolder;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) {
        console.error('Update user error:', error);
        set({ isLoading: false });
        return false;
      }

      // Update local state
      const updatedUser = { ...currentUser, ...userData };
      
      set({ 
        user: updatedUser, 
        isLoading: false 
      });
      
      localStorage.setItem('mano-pro-user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  initializeAuth: async () => {
    try {
      // Check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile
        const userProfile = await getUserProfile(session.user.id);
        
        const user = transformDatabaseUser(userProfile);

        set({ user, isAuthenticated: true });
        localStorage.setItem('mano-pro-user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      // Clear any stale data
      localStorage.removeItem('mano-pro-user');
      set({ user: null, isAuthenticated: false });
    }
  }
}));

// Listen to auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    useAuthStore.getState().setUser(null);
    localStorage.removeItem('mano-pro-user');
  } else if (event === 'SIGNED_IN' && session.user) {
    // This will be handled by the login function
    // We don't want to duplicate the profile fetch here
  }
});

// Initialize auth state on app start
useAuthStore.getState().initializeAuth();