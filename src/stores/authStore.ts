// Authentication store using Zustand
// Manages user authentication state and login/logout functionality

import { create } from 'zustand';
import { AuthState, User } from '../types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  setUser: (user: User | null) => void;
}

// Mock authentication - replace with real API calls
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'gestionnaire@test.com',
    password: 'password123',
    firstName: 'Marie',
    lastName: 'Dupont',
    phone: '0123456789',
    company: 'Syndic Paris Centre',
    role: 'gestionnaire',
    isVerified: true,
    createdAt: new Date()
  },
  {
    id: '2',
    email: 'artisan@test.com',
    password: 'password123',
    firstName: 'Pierre',
    lastName: 'Martin',
    phone: '0987654321',
    company: 'Plomberie Martin',
    role: 'artisan',
    isVerified: true,
    isCertified: true,
    createdAt: new Date()
  },
  {
    id: '3',
    email: 'admin@mano-pro.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'Mano-Pro',
    phone: '0100000000',
    company: 'Mano-Pro',
    role: 'admin',
    isVerified: true,
    createdAt: new Date()
  }
];

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      set({ 
        user: userWithoutPassword, 
        isAuthenticated: true, 
        isLoading: false 
      });
      localStorage.setItem('mano-pro-user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('mano-pro-user');
  },

  register: async (userData) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      phone: userData.phone!,
      company: userData.company!,
      role: userData.role!,
      isVerified: false,
      isCertified: userData.role === 'artisan' ? false : undefined,
      createdAt: new Date()
    };
    
    set({ 
      user: newUser, 
      isAuthenticated: true, 
      isLoading: false 
    });
    localStorage.setItem('mano-pro-user', JSON.stringify(newUser));
    return true;
  },

  updateUser: async (userData) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentUser = get().user;
    if (!currentUser) {
      set({ isLoading: false });
      return false;
    }
    
    const updatedUser = { ...currentUser, ...userData };
    
    set({ 
      user: updatedUser, 
      isLoading: false 
    });
    localStorage.setItem('mano-pro-user', JSON.stringify(updatedUser));
    return true;
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  }
}));

// Initialize auth state from localStorage
const savedUser = localStorage.getItem('mano-pro-user');
if (savedUser) {
  try {
    const user = JSON.parse(savedUser);
    useAuthStore.getState().setUser(user);
  } catch (error) {
    localStorage.removeItem('mano-pro-user');
  }
}