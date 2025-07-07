// Project management store
// Handles project lifecycle, chat, timeline, and payment processing

import { create } from 'zustand';
import { Project, ChatMessage, Payment, Invoice, ProjectStatus, PaymentStatus } from '../types';

interface ProjectStore {
  projects: Project[];
  messages: ChatMessage[];
  payments: Payment[];
  invoices: Invoice[];
  isLoading: boolean;
  
  // Project actions
  createProject: (emergencyId: string, proposalId: string) => Promise<string>;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  getProjectsByUser: (userId: string, role: string) => Project[];
  getProjectById: (id: string) => Project | undefined;
  addTimelineEntry: (projectId: string, entry: Omit<ProjectTimelineEntry, 'id'>) => void;
  uploadProjectPhotos: (projectId: string, phase: 'before' | 'during' | 'after', photos: string[]) => void;
  
  // Chat actions
  sendMessage: (projectId: string, senderId: string, senderName: string, message: string, photos?: string[]) => Promise<string>;
  getMessagesByProject: (projectId: string) => ChatMessage[];
  markMessagesAsRead: (projectId: string, userId: string) => void;
  
  // Payment actions
  createPaymentRequest: (projectId: string, artisanId: string, amount: number, description: string) => Promise<string>;
  processPayment: (paymentId: string) => Promise<boolean>;
  getPaymentsByUser: (userId: string, role: string) => Payment[];
  generateInvoice: (paymentId: string) => Promise<string>;
  
  // Initialize mock data
  initializeMockData: () => void;
}

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    emergencyId: '2',
    proposalId: '2',
    gestionnaire: {
      id: '1',
      email: 'gestionnaire@test.com',
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '0123456789',
      company: 'Syndic Paris Centre',
      role: 'gestionnaire',
      isVerified: true,
      createdAt: new Date()
    },
    artisan: {
      id: '2',
      email: 'artisan@test.com',
      firstName: 'Pierre',
      lastName: 'Martin',
      phone: '0987654321',
      company: 'Plomberie Martin',
      role: 'artisan',
      isVerified: true,
      isCertified: true,
      rating: 4.8,
      createdAt: new Date()
    },
    title: 'Panne électrique - Hall d\'entrée',
    description: 'Plus d\'électricité dans le hall d\'entrée et les parties communes. Problème au niveau du tableau électrique.',
    address: '42 Avenue des Champs-Élysées, 75008 Paris',
    price: 450,
    status: 'in_progress',
    startDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
    photos: {
      before: ['https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg'],
      during: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg'],
      after: []
    },
    timeline: [
      {
        id: '1',
        type: 'status_change',
        message: 'Projet accepté et démarré',
        author: 'System',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'photo_upload',
        message: 'Photos avant intervention ajoutées',
        author: 'Pierre Martin',
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000),
        photos: ['https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg']
      },
      {
        id: '3',
        type: 'message',
        message: 'Diagnostic terminé, remplacement du disjoncteur principal nécessaire',
        author: 'Pierre Martin',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
      }
    ]
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    projectId: '1',
    senderId: '2',
    senderName: 'Pierre Martin',
    message: 'Bonjour, je suis arrivé sur site. Le problème semble venir du tableau électrique principal.',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
    isRead: true
  },
  {
    id: '2',
    projectId: '1',
    senderId: '1',
    senderName: 'Marie Dupont',
    message: 'Parfait, combien de temps estimez-vous pour la réparation ?',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
    isRead: true
  },
  {
    id: '3',
    projectId: '1',
    senderId: '2',
    senderName: 'Pierre Martin',
    message: 'Environ 3-4 heures. Je dois remplacer le disjoncteur principal et vérifier toute l\'installation.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isRead: false
  }
];

const mockPayments: Payment[] = [
  {
    id: '1',
    projectId: '1',
    artisanId: '2',
    gestionnairId: '1',
    amount: 450,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Réparation électrique - Hall d\'entrée'
  }
];

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  messages: [],
  payments: [],
  invoices: [],
  isLoading: false,

  createProject: async (emergencyId, proposalId) => {
    set({ isLoading: true });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newProject: Project = {
      id: Date.now().toString(),
      emergencyId,
      proposalId,
      gestionnaire: { id: 'temp' } as any, // Will be populated with real data
      artisan: { id: 'temp' } as any,
      title: 'New Project',
      description: 'Project description',
      address: 'Project address',
      price: 0,
      status: 'accepted',
      photos: { before: [], during: [], after: [] },
      timeline: [
        {
          id: Date.now().toString(),
          type: 'status_change',
          message: 'Projet créé et accepté',
          author: 'System',
          timestamp: new Date()
        }
      ]
    };
    
    set(state => ({
      projects: [newProject, ...state.projects],
      isLoading: false
    }));
    
    return newProject.id;
  },

  updateProjectStatus: (id, status) => {
    set(state => ({
      projects: state.projects.map(project => {
        if (project.id === id) {
          const updatedProject = { ...project, status };
          
          // Add timeline entry
          const timelineEntry = {
            id: Date.now().toString(),
            type: 'status_change' as const,
            message: `Statut changé vers: ${status}`,
            author: 'System',
            timestamp: new Date()
          };
          
          updatedProject.timeline = [...project.timeline, timelineEntry];
          
          if (status === 'completed') {
            updatedProject.completedDate = new Date();
          }
          
          return updatedProject;
        }
        return project;
      })
    }));
  },

  getProjectsByUser: (userId, role) => {
    return get().projects.filter(project => 
      role === 'gestionnaire' ? project.gestionnaire.id === userId : project.artisan.id === userId
    );
  },

  getProjectById: (id) => {
    return get().projects.find(project => project.id === id);
  },

  addTimelineEntry: (projectId, entry) => {
    set(state => ({
      projects: state.projects.map(project => {
        if (project.id === projectId) {
          const newEntry = {
            ...entry,
            id: Date.now().toString()
          };
          return {
            ...project,
            timeline: [...project.timeline, newEntry]
          };
        }
        return project;
      })
    }));
  },

  uploadProjectPhotos: (projectId, phase, photos) => {
    set(state => ({
      projects: state.projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            photos: {
              ...project.photos,
              [phase]: [...project.photos[phase], ...photos]
            }
          };
        }
        return project;
      })
    }));
    
    // Add timeline entry
    get().addTimelineEntry(projectId, {
      type: 'photo_upload',
      message: `Photos ${phase} ajoutées`,
      author: 'User',
      timestamp: new Date(),
      photos
    });
  },

  sendMessage: async (projectId, senderId, senderName, message, photos) => {
    set({ isLoading: true });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      projectId,
      senderId,
      senderName,
      message,
      timestamp: new Date(),
      photos,
      isRead: false
    };
    
    set(state => ({
      messages: [newMessage, ...state.messages],
      isLoading: false
    }));
    
    return newMessage.id;
  },

  getMessagesByProject: (projectId) => {
    return get().messages
      .filter(message => message.projectId === projectId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  markMessagesAsRead: (projectId, userId) => {
    set(state => ({
      messages: state.messages.map(message => 
        message.projectId === projectId && message.senderId !== userId
          ? { ...message, isRead: true }
          : message
      )
    }));
  },

  createPaymentRequest: async (projectId, artisanId, amount, description) => {
    set({ isLoading: true });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPayment: Payment = {
      id: Date.now().toString(),
      projectId,
      artisanId,
      gestionnairId: 'temp',
      amount,
      status: 'pending',
      createdAt: new Date(),
      description
    };
    
    set(state => ({
      payments: [newPayment, ...state.payments],
      isLoading: false
    }));
    
    return newPayment.id;
  },

  processPayment: async (paymentId) => {
    set({ isLoading: true });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    set(state => ({
      payments: state.payments.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: 'completed' as PaymentStatus, processedAt: new Date() }
          : payment
      ),
      isLoading: false
    }));
    
    return true;
  },

  getPaymentsByUser: (userId, role) => {
    return get().payments.filter(payment => 
      role === 'gestionnaire' ? payment.gestionnairId === userId : payment.artisanId === userId
    );
  },

  generateInvoice: async (paymentId) => {
    set({ isLoading: true });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const payment = get().payments.find(p => p.id === paymentId);
    if (!payment) return '';
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      projectId: payment.projectId,
      paymentId,
      invoiceNumber: `INV-${Date.now()}`,
      amount: payment.amount,
      taxAmount: payment.amount * 0.2,
      totalAmount: payment.amount * 1.2,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'sent',
      pdfUrl: `https://example.com/invoices/${Date.now()}.pdf`
    };
    
    set(state => ({
      invoices: [newInvoice, ...state.invoices],
      isLoading: false
    }));
    
    return newInvoice.id;
  },

  initializeMockData: () => {
    set({
      projects: mockProjects,
      messages: mockMessages,
      payments: mockPayments
    });
  }
}));

// Initialize mock data
useProjectStore.getState().initializeMockData();