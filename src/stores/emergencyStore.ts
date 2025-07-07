// Emergency management store
// Handles emergency creation, proposals, and project management

import { create } from 'zustand';
import { Emergency, Proposal, Project, EmergencyStatus, ProposalStatus } from '../types';

interface EmergencyStore {
  emergencies: Emergency[];
  proposals: Proposal[];
  projects: Project[];
  isLoading: boolean;
  
  // Emergency actions
  createEmergency: (emergency: Omit<Emergency, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateEmergencyStatus: (id: string, status: EmergencyStatus) => void;
  getEmergenciesByUser: (userId: string) => Emergency[];
  getEmergencyById: (id: string) => Emergency | undefined;
  
  // Proposal actions
  createProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateProposalStatus: (id: string, status: ProposalStatus) => void;
  getProposalsByEmergency: (emergencyId: string) => Proposal[];
  getProposalsByArtisan: (artisanId: string) => Proposal[];
  
  // Project actions
  createProject: (emergencyId: string, proposalId: string) => Promise<string>;
  updateProjectStatus: (id: string, status: string) => void;
  getProjectsByUser: (userId: string, role: string) => Project[];
  
  // Initialize with mock data
  initializeMockData: () => void;
}

// Mock data for development
const mockEmergencies: Emergency[] = [
  {
    id: '1',
    title: 'Fuite d\'eau urgente - Cuisine',
    description: 'Fuite importante sous l\'évier de la cuisine. L\'eau s\'accumule rapidement et risque d\'endommager le parquet.',
    address: '15 Rue de Rivoli, 75001 Paris',
    arrondissement: 1,
    trade: 'Plomberie',
    maxBudget: 300,
    status: 'open',
    createdBy: '1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    photos: [
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
      'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg'
    ],
    urgencyLevel: 'high'
  },
  {
    id: '2',
    title: 'Panne électrique - Hall d\'entrée',
    description: 'Plus d\'électricité dans le hall d\'entrée et les parties communes. Problème au niveau du tableau électrique.',
    address: '42 Avenue des Champs-Élysées, 75008 Paris',
    arrondissement: 8,
    trade: 'Électricité',
    maxBudget: 500,
    status: 'in_progress',
    createdBy: '1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    photos: [
      'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg'
    ],
    urgencyLevel: 'critical',
    acceptedProposalId: '2'
  },
  {
    id: '3',
    title: 'Serrure bloquée - Porte d\'entrée',
    description: 'La serrure de la porte d\'entrée principale est complètement bloquée. Les résidents ne peuvent plus accéder à l\'immeuble.',
    address: '28 Rue de la Paix, 75002 Paris',
    arrondissement: 2,
    trade: 'Serrurerie',
    maxBudget: 200,
    status: 'completed',
    createdBy: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    photos: [],
    urgencyLevel: 'critical'
  }
];

const mockProposals: Proposal[] = [
  {
    id: '1',
    emergencyId: '1',
    artisanId: '2',
    artisanName: 'Pierre Martin',
    artisanCompany: 'Plomberie Martin',
    artisanRating: 4.8,
    price: 250,
    description: 'Intervention rapide pour réparer la fuite. Remplacement du joint défaillant et vérification de l\'installation.',
    estimatedDuration: '2 heures',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    id: '2',
    emergencyId: '2',
    artisanId: '2',
    artisanName: 'Pierre Martin',
    artisanCompany: 'Plomberie Martin',
    artisanRating: 4.8,
    price: 450,
    description: 'Diagnostic complet du tableau électrique et réparation du défaut. Remise aux normes si nécessaire.',
    estimatedDuration: '4 heures',
    status: 'accepted',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000) // 20 hours ago
  }
];

export const useEmergencyStore = create<EmergencyStore>((set, get) => ({
  emergencies: [],
  proposals: [],
  projects: [],
  isLoading: false,

  createEmergency: async (emergencyData) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newEmergency: Emergency = {
      ...emergencyData,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'open'
    };
    
    set(state => ({
      emergencies: [newEmergency, ...state.emergencies],
      isLoading: false
    }));
    
    return newEmergency.id;
  },

  updateEmergencyStatus: (id, status) => {
    set(state => ({
      emergencies: state.emergencies.map(emergency =>
        emergency.id === id ? { ...emergency, status } : emergency
      )
    }));
  },

  getEmergenciesByUser: (userId) => {
    return get().emergencies.filter(emergency => emergency.createdBy === userId);
  },

  getEmergencyById: (id) => {
    return get().emergencies.find(emergency => emergency.id === id);
  },

  createProposal: async (proposalData) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newProposal: Proposal = {
      ...proposalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending'
    };
    
    set(state => ({
      proposals: [newProposal, ...state.proposals],
      isLoading: false
    }));
    
    return newProposal.id;
  },

  updateProposalStatus: (id, status) => {
    set(state => ({
      proposals: state.proposals.map(proposal =>
        proposal.id === id ? { ...proposal, status } : proposal
      )
    }));
    
    // If proposal is accepted, update emergency status
    if (status === 'accepted') {
      const proposal = get().proposals.find(p => p.id === id);
      if (proposal) {
        get().updateEmergencyStatus(proposal.emergencyId, 'in_progress');
        // Create project
        get().createProject(proposal.emergencyId, id);
      }
    }
  },

  getProposalsByEmergency: (emergencyId) => {
    return get().proposals.filter(proposal => proposal.emergencyId === emergencyId);
  },

  getProposalsByArtisan: (artisanId) => {
    return get().proposals.filter(proposal => proposal.artisanId === artisanId);
  },

  createProject: async (emergencyId, proposalId) => {
    const emergency = get().getEmergencyById(emergencyId);
    const proposal = get().proposals.find(p => p.id === proposalId);
    
    if (!emergency || !proposal) return '';
    
    const newProject: Project = {
      id: Date.now().toString(),
      emergencyId,
      proposalId,
      gestionnaire: { id: emergency.createdBy } as User, // Will be populated with full user data
      artisan: { id: proposal.artisanId } as User, // Will be populated with full user data
      title: emergency.title,
      description: emergency.description,
      address: emergency.address,
      price: proposal.price,
      status: 'accepted',
      photos: { before: [], during: [], after: [] },
      timeline: [
        {
          id: Date.now().toString(),
          type: 'status_change',
          message: 'Projet accepté et démarré',
          author: 'System',
          timestamp: new Date()
        }
      ]
    };
    
    set(state => ({
      projects: [newProject, ...state.projects]
    }));
    
    return newProject.id;
  },

  updateProjectStatus: (id, status) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === id ? { ...project, status: status as ProjectStatus } : project
      )
    }));
  },

  getProjectsByUser: (userId, role) => {
    return get().projects.filter(project => 
      role === 'gestionnaire' ? project.gestionnaire.id === userId : project.artisan.id === userId
    );
  },

  initializeMockData: () => {
    set({
      emergencies: mockEmergencies,
      proposals: mockProposals
    });
  }
}));

// Initialize mock data
useEmergencyStore.getState().initializeMockData();