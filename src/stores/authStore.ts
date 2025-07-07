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
      // First check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email!)
        .single();

      if (existingUser) {
        console.error('User already exists with this email');
        set({ isLoading: false });
        return false;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation for now
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('Registration auth error:', authError.message || authError);
        set({ isLoading: false });
        return false;
      }

      if (!authData.user) {
        console.error('No user returned from auth signup');
        set({ isLoading: false });
        return false;
      }

      // Wait a moment for auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email!,
          first_name: userData.firstName!,
          last_name: userData.lastName!,
          phone: userData.phone!,
          company: userData.company!,
          role: userData.role!,
          is_verified: false,
          is_certified: userData.role === 'artisan' ? false : null,
          arrondissements: userData.arrondissements || null,
          trades: userData.trades || null,
          completed_projects: 0
        });

      if (profileError) {
        console.error('Registration profile error:', profileError.message || profileError);
        // Clean up auth user if profile creation failed
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
        }
        set({ isLoading: false });
        return false;
      }

      // Create user object for state
      const newUser: User = {
        id: authData.user.id,
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        phone: userData.phone!,
        company: userData.company!,
        role: userData.role!,
        isVerified: false,
        isCertified: userData.role === 'artisan' ? false : undefined,
        createdAt: new Date(),
        arrondissements: userData.arrondissements,
        trades: userData.trades,
        completedProjects: 0
      };
      
      set({ 
        user: newUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      localStorage.setItem('mano-pro-user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error instanceof Error ? error.message : error);
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