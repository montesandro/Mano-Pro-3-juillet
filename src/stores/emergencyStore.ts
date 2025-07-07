// Emergency management store with Supabase integration
// Handles emergency creation, proposals, and project management with real database operations

import { create } from 'zustand';
import { Emergency, Proposal, Project, EmergencyStatus, ProposalStatus, User } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface EmergencyStore {
  emergencies: Emergency[];
  proposals: Proposal[];
  projects: Project[];
  isLoading: boolean;
  
  // Emergency actions
  createEmergency: (emergency: Omit<Emergency, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateEmergencyStatus: (id: string, status: EmergencyStatus) => Promise<void>;
  getEmergenciesByUser: (userId: string) => Emergency[];
  getEmergencyById: (id: string) => Emergency | undefined;
  loadEmergenciesByUser: (userId: string) => Promise<void>;
  loadEmergencyById: (id: string) => Promise<void>;
  
  // Proposal actions
  createProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateProposalStatus: (id: string, status: ProposalStatus) => Promise<void>;
  getProposalsByEmergency: (emergencyId: string) => Proposal[];
  getProposalsByArtisan: (artisanId: string) => Proposal[];
  loadProposalsByEmergency: (emergencyId: string) => Promise<void>;
  loadProposalsByArtisan: (artisanId: string) => Promise<void>;
  
  // Project actions
  createProject: (emergencyId: string, proposalId: string) => Promise<string>;
  updateProjectStatus: (id: string, status: string) => Promise<void>;
  getProjectsByUser: (userId: string, role: string) => Project[];
  loadProjectsByUser: (userId: string, role: string) => Promise<void>;
}

// Helper function to transform database emergency to application format
const transformEmergency = (dbEmergency: any): Emergency => ({
  id: dbEmergency.id,
  title: dbEmergency.title,
  description: dbEmergency.description,
  address: dbEmergency.address,
  arrondissement: dbEmergency.arrondissement,
  trade: dbEmergency.trade,
  maxBudget: dbEmergency.max_budget,
  status: dbEmergency.status,
  createdBy: dbEmergency.created_by,
  createdAt: new Date(dbEmergency.created_at),
  photos: dbEmergency.photos || [],
  urgencyLevel: dbEmergency.urgency_level,
  acceptedProposalId: dbEmergency.accepted_proposal_id
});

// Helper function to transform database proposal to application format
const transformProposal = (dbProposal: any): Proposal => ({
  id: dbProposal.id,
  emergencyId: dbProposal.emergency_id,
  artisanId: dbProposal.artisan_id,
  artisanName: dbProposal.artisan_name,
  artisanCompany: dbProposal.artisan_company,
  artisanRating: dbProposal.artisan_rating || 0,
  price: dbProposal.price,
  description: dbProposal.description,
  estimatedDuration: dbProposal.estimated_duration,
  status: dbProposal.status,
  createdAt: new Date(dbProposal.created_at)
});

// Helper function to transform database user to application format
const transformUser = (dbUser: any): User => ({
  id: dbUser.id,
  email: dbUser.email,
  firstName: dbUser.first_name,
  lastName: dbUser.last_name,
  phone: dbUser.phone,
  company: dbUser.company,
  role: dbUser.role,
  isVerified: dbUser.is_verified,
  isCertified: dbUser.is_certified,
  createdAt: new Date(dbUser.created_at),
  arrondissements: dbUser.arrondissements,
  trades: dbUser.trades,
  rating: dbUser.rating,
  completedProjects: dbUser.completed_projects,
  avatar: dbUser.avatar,
  bankDetails: dbUser.bank_details_iban ? {
    iban: dbUser.bank_details_iban,
    bic: dbUser.bank_details_bic || '',
    accountHolder: dbUser.bank_details_account_holder || ''
  } : undefined
});

export const useEmergencyStore = create<EmergencyStore>((set, get) => ({
  emergencies: [],
  proposals: [],
  projects: [],
  isLoading: false,

  createEmergency: async (emergencyData) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('emergencies')
        .insert({
          title: emergencyData.title,
          description: emergencyData.description,
          address: emergencyData.address,
          arrondissement: emergencyData.arrondissement,
          trade: emergencyData.trade,
          max_budget: emergencyData.maxBudget,
          urgency_level: emergencyData.urgencyLevel,
          created_by: emergencyData.createdBy,
          photos: emergencyData.photos || []
        })
        .select()
        .single();

      if (error) {
        console.error('Create emergency error:', error);
        throw error;
      }

      const newEmergency = transformEmergency(data);
      
      set(state => ({
        emergencies: [newEmergency, ...state.emergencies],
        isLoading: false
      }));
      
      return newEmergency.id;
    } catch (error) {
      console.error('Create emergency error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateEmergencyStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('emergencies')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Update emergency status error:', error);
        throw error;
      }

      set(state => ({
        emergencies: state.emergencies.map(emergency =>
          emergency.id === id ? { ...emergency, status } : emergency
        )
      }));
    } catch (error) {
      console.error('Update emergency status error:', error);
      throw error;
    }
  },

  getEmergenciesByUser: (userId) => {
    return get().emergencies.filter(emergency => emergency.createdBy === userId);
  },

  getEmergencyById: (id) => {
    return get().emergencies.find(emergency => emergency.id === id);
  },

  loadEmergenciesByUser: async (userId) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('emergencies')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load emergencies error:', error);
        throw error;
      }

      const emergencies = data.map(transformEmergency);
      
      set(state => ({
        emergencies: emergencies,
        isLoading: false
      }));
    } catch (error) {
      console.error('Load emergencies error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  loadEmergencyById: async (id) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('emergencies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Load emergency error:', error);
        throw error;
      }

      const emergency = transformEmergency(data);
      
      set(state => ({
        emergencies: state.emergencies.some(e => e.id === id)
          ? state.emergencies.map(e => e.id === id ? emergency : e)
          : [...state.emergencies, emergency],
        isLoading: false
      }));
    } catch (error) {
      console.error('Load emergency error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  createProposal: async (proposalData) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert({
          emergency_id: proposalData.emergencyId,
          artisan_id: proposalData.artisanId,
          artisan_name: proposalData.artisanName,
          artisan_company: proposalData.artisanCompany,
          artisan_rating: proposalData.artisanRating,
          price: proposalData.price,
          description: proposalData.description,
          estimated_duration: proposalData.estimatedDuration
        })
        .select()
        .single();

      if (error) {
        console.error('Create proposal error:', error);
        throw error;
      }

      const newProposal = transformProposal(data);
      
      set(state => ({
        proposals: [newProposal, ...state.proposals],
        isLoading: false
      }));
      
      return newProposal.id;
    } catch (error) {
      console.error('Create proposal error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateProposalStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Update proposal status error:', error);
        throw error;
      }

      set(state => ({
        proposals: state.proposals.map(proposal =>
          proposal.id === id ? { ...proposal, status } : proposal
        )
      }));
      
      // If proposal is accepted, update emergency status and create project
      if (status === 'accepted') {
        const proposal = get().proposals.find(p => p.id === id);
        if (proposal) {
          await get().updateEmergencyStatus(proposal.emergencyId, 'in_progress');
          await get().createProject(proposal.emergencyId, id);
        }
      }
    } catch (error) {
      console.error('Update proposal status error:', error);
      throw error;
    }
  },

  getProposalsByEmergency: (emergencyId) => {
    return get().proposals.filter(proposal => proposal.emergencyId === emergencyId);
  },

  getProposalsByArtisan: (artisanId) => {
    return get().proposals.filter(proposal => proposal.artisanId === artisanId);
  },

  loadProposalsByEmergency: async (emergencyId) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('emergency_id', emergencyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load proposals error:', error);
        throw error;
      }

      const proposals = data.map(transformProposal);
      
      set(state => ({
        proposals: [
          ...state.proposals.filter(p => p.emergencyId !== emergencyId),
          ...proposals
        ],
        isLoading: false
      }));
    } catch (error) {
      console.error('Load proposals error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  loadProposalsByArtisan: async (artisanId) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('artisan_id', artisanId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load proposals error:', error);
        throw error;
      }

      const proposals = data.map(transformProposal);
      
      set(state => ({
        proposals: [
          ...state.proposals.filter(p => p.artisanId !== artisanId),
          ...proposals
        ],
        isLoading: false
      }));
    } catch (error) {
      console.error('Load proposals error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  createProject: async (emergencyId, proposalId) => {
    try {
      // Get emergency and proposal details
      const { data: emergencyData, error: emergencyError } = await supabase
        .from('emergencies')
        .select('*')
        .eq('id', emergencyId)
        .single();

      if (emergencyError) {
        console.error('Error fetching emergency:', emergencyError);
        throw emergencyError;
      }

      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError) {
        console.error('Error fetching proposal:', proposalError);
        throw proposalError;
      }

      // Get complete user profiles for gestionnaire and artisan
      const { data: gestionnaireData, error: gestionnaireError } = await supabase
        .from('users')
        .select('*')
        .eq('id', emergencyData.created_by)
        .single();

      if (gestionnaireError) {
        console.error('Error fetching gestionnaire:', gestionnaireError);
        throw gestionnaireError;
      }

      const { data: artisanData, error: artisanError } = await supabase
        .from('users')
        .select('*')
        .eq('id', proposalData.artisan_id)
        .single();

      if (artisanError) {
        console.error('Error fetching artisan:', artisanError);
        throw artisanError;
      }

      // Create project in database
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          emergency_id: emergencyId,
          proposal_id: proposalId,
          gestionnaire_id: emergencyData.created_by,
          artisan_id: proposalData.artisan_id,
          title: emergencyData.title,
          description: emergencyData.description,
          address: emergencyData.address,
          price: proposalData.price,
          status: 'accepted'
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        throw projectError;
      }

      // Create initial timeline entry
      await supabase
        .from('project_timeline_entries')
        .insert({
          project_id: projectData.id,
          type: 'status_change',
          message: 'Projet accepté et démarré',
          author: 'System'
        });

      // Transform users and create project object
      const gestionnaire = transformUser(gestionnaireData);
      const artisan = transformUser(artisanData);

      const newProject: Project = {
        id: projectData.id,
        emergencyId,
        proposalId,
        gestionnaire,
        artisan,
        title: projectData.title,
        description: projectData.description,
        address: projectData.address,
        price: projectData.price,
        status: projectData.status,
        startDate: projectData.start_date ? new Date(projectData.start_date) : undefined,
        completedDate: projectData.completed_date ? new Date(projectData.completed_date) : undefined,
        photos: {
          before: projectData.photos_before || [],
          during: projectData.photos_during || [],
          after: projectData.photos_after || []
        },
        timeline: [
          {
            id: Date.now().toString(),
            type: 'status_change',
            message: 'Projet accepté et démarré',
            author: 'System',
            timestamp: new Date()
          }
        ],
        rating: projectData.rating,
        review: projectData.review
      };
      
      set(state => ({
        projects: [newProject, ...state.projects]
      }));
      
      return newProject.id;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  updateProjectStatus: async (id, status) => {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Update project status error:', error);
        throw error;
      }

      // Add timeline entry
      await supabase
        .from('project_timeline_entries')
        .insert({
          project_id: id,
          type: 'status_change',
          message: `Statut changé vers: ${status}`,
          author: 'System'
        });

      set(state => ({
        projects: state.projects.map(project => {
          if (project.id === id) {
            const updatedProject = { ...project, status: status as any };
            
            if (status === 'completed') {
              updatedProject.completedDate = new Date();
            }
            
            // Add timeline entry to local state
            const timelineEntry = {
              id: Date.now().toString(),
              type: 'status_change' as const,
              message: `Statut changé vers: ${status}`,
              author: 'System',
              timestamp: new Date()
            };
            
            updatedProject.timeline = [...project.timeline, timelineEntry];
            
            return updatedProject;
          }
          return project;
        })
      }));
    } catch (error) {
      console.error('Update project status error:', error);
      throw error;
    }
  },

  getProjectsByUser: (userId, role) => {
    return get().projects.filter(project => 
      role === 'gestionnaire' ? project.gestionnaire.id === userId : project.artisan.id === userId
    );
  },

  loadProjectsByUser: async (userId, role) => {
    set({ isLoading: true });
    
    try {
      const column = role === 'gestionnaire' ? 'gestionnaire_id' : 'artisan_id';
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          gestionnaire:gestionnaire_id(*),
          artisan:artisan_id(*)
        `)
        .eq(column, userId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Load projects error:', error);
        throw error;
      }

      const projects: Project[] = data.map(projectData => ({
        id: projectData.id,
        emergencyId: projectData.emergency_id,
        proposalId: projectData.proposal_id,
        gestionnaire: transformUser(projectData.gestionnaire),
        artisan: transformUser(projectData.artisan),
        title: projectData.title,
        description: projectData.description,
        address: projectData.address,
        price: projectData.price,
        status: projectData.status,
        startDate: projectData.start_date ? new Date(projectData.start_date) : undefined,
        completedDate: projectData.completed_date ? new Date(projectData.completed_date) : undefined,
        photos: {
          before: projectData.photos_before || [],
          during: projectData.photos_during || [],
          after: projectData.photos_after || []
        },
        timeline: [], // Will be loaded separately if needed
        rating: projectData.rating,
        review: projectData.review
      }));
      
      set(state => ({
        projects: projects,
        isLoading: false
      }));
    } catch (error) {
      console.error('Load projects error:', error);
      set({ isLoading: false });
      throw error;
    }
  }
}));