// Project management store with Supabase integration
// Handles project lifecycle, chat, timeline, and payment processing with real database operations

import { create } from 'zustand';
import { Project, ChatMessage, Payment, Invoice, ProjectStatus, PaymentStatus, ProjectTimelineEntry, User } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface ProjectStore {
  projects: Project[];
  messages: ChatMessage[];
  payments: Payment[];
  invoices: Invoice[];
  isLoading: boolean;
  
  // Project actions
  createProject: (emergencyId: string, proposalId: string) => Promise<string>;
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;
  getProjectsByUser: (userId: string, role: string) => Project[];
  getProjectById: (id: string) => Project | undefined;
  loadProjectsByUser: (userId: string, role: string) => Promise<void>;
  loadProjectById: (id: string) => Promise<void>;
  addTimelineEntry: (projectId: string, entry: Omit<ProjectTimelineEntry, 'id'>) => Promise<void>;
  uploadProjectPhotos: (projectId: string, phase: 'before' | 'during' | 'after', photos: File[]) => Promise<void>;
  loadProjectTimeline: (projectId: string) => Promise<void>;
  
  // Chat actions
  sendMessage: (projectId: string, senderId: string, senderName: string, message: string, photos?: File[]) => Promise<string>;
  getMessagesByProject: (projectId: string) => ChatMessage[];
  loadMessagesByProject: (projectId: string) => Promise<void>;
  markMessagesAsRead: (projectId: string, userId: string) => Promise<void>;
  
  // Payment actions
  createPaymentRequest: (projectId: string, artisanId: string, amount: number, description: string) => Promise<string>;
  processPayment: (paymentId: string) => Promise<boolean>;
  getPaymentsByUser: (userId: string, role: string) => Payment[];
  loadPaymentsByUser: (userId: string, role: string) => Promise<void>;
  generateInvoice: (paymentId: string) => Promise<string>;
}

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

// Helper function to transform database project to application format
const transformProject = (dbProject: any): Project => ({
  id: dbProject.id,
  emergencyId: dbProject.emergency_id,
  proposalId: dbProject.proposal_id,
  gestionnaire: transformUser(dbProject.gestionnaire),
  artisan: transformUser(dbProject.artisan),
  title: dbProject.title,
  description: dbProject.description,
  address: dbProject.address,
  price: dbProject.price,
  status: dbProject.status,
  startDate: dbProject.start_date ? new Date(dbProject.start_date) : undefined,
  completedDate: dbProject.completed_date ? new Date(dbProject.completed_date) : undefined,
  photos: {
    before: dbProject.photos_before || [],
    during: dbProject.photos_during || [],
    after: dbProject.photos_after || []
  },
  timeline: [], // Will be loaded separately
  rating: dbProject.rating,
  review: dbProject.review
});

// Helper function to transform database timeline entry to application format
const transformTimelineEntry = (dbEntry: any): ProjectTimelineEntry => ({
  id: dbEntry.id,
  type: dbEntry.type,
  message: dbEntry.message,
  author: dbEntry.author,
  timestamp: new Date(dbEntry.timestamp),
  photos: dbEntry.photos || []
});

// Helper function to transform database chat message to application format
const transformChatMessage = (dbMessage: any): ChatMessage => ({
  id: dbMessage.id,
  projectId: dbMessage.project_id,
  senderId: dbMessage.sender_id,
  senderName: dbMessage.sender_name,
  message: dbMessage.message,
  timestamp: new Date(dbMessage.timestamp),
  photos: dbMessage.photos || [],
  isRead: dbMessage.is_read
});

// Helper function to transform database payment to application format
const transformPayment = (dbPayment: any): Payment => ({
  id: dbPayment.id,
  projectId: dbPayment.project_id,
  artisanId: dbPayment.artisan_id,
  gestionnairId: dbPayment.gestionnaire_id,
  amount: dbPayment.amount,
  status: dbPayment.status,
  invoiceUrl: dbPayment.invoice_url,
  createdAt: new Date(dbPayment.created_at),
  processedAt: dbPayment.processed_at ? new Date(dbPayment.processed_at) : undefined,
  description: dbPayment.description
});

// Helper function to upload files to Supabase Storage
const uploadFiles = async (files: File[], bucket: string, folder: string): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  messages: [],
  payments: [],
  invoices: [],
  isLoading: false,

  createProject: async (emergencyId, proposalId) => {
    set({ isLoading: true });
    
    try {
      // Get emergency and proposal details
      const { data: emergencyData, error: emergencyError } = await supabase
        .from('emergencies')
        .select('*')
        .eq('id', emergencyId)
        .single();

      if (emergencyError) throw emergencyError;

      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError) throw proposalError;

      // Get complete user profiles
      const { data: gestionnaireData, error: gestionnaireError } = await supabase
        .from('users')
        .select('*')
        .eq('id', emergencyData.created_by)
        .single();

      if (gestionnaireError) throw gestionnaireError;

      const { data: artisanData, error: artisanError } = await supabase
        .from('users')
        .select('*')
        .eq('id', proposalData.artisan_id)
        .single();

      if (artisanError) throw artisanError;

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

      if (projectError) throw projectError;

      // Create initial timeline entry
      await supabase
        .from('project_timeline_entries')
        .insert({
          project_id: projectData.id,
          type: 'status_change',
          message: 'Projet créé et accepté',
          author: 'System'
        });

      // Create project object
      const newProject: Project = {
        id: projectData.id,
        emergencyId,
        proposalId,
        gestionnaire: transformUser(gestionnaireData),
        artisan: transformUser(artisanData),
        title: projectData.title,
        description: projectData.description,
        address: projectData.address,
        price: projectData.price,
        status: projectData.status,
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
    } catch (error) {
      console.error('Create project error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateProjectStatus: (id, status) => {
    return get().addTimelineEntry(id, {
      type: 'status_change',
      message: `Statut changé vers: ${status}`,
      author: 'System',
      timestamp: new Date()
    }).then(async () => {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        projects: state.projects.map(project => {
          if (project.id === id) {
            const updatedProject = { ...project, status };
            if (status === 'completed') {
              updatedProject.completedDate = new Date();
            }
            return updatedProject;
          }
          return project;
        })
      }));
    });
  },

  getProjectsByUser: (userId, role) => {
    return get().projects.filter(project => 
      role === 'gestionnaire' ? project.gestionnaire.id === userId : project.artisan.id === userId
    );
  },

  getProjectById: (id) => {
    return get().projects.find(project => project.id === id);
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

      if (error) throw error;

      const projects = data.map(transformProject);
      
      set({
        projects,
        isLoading: false
      });
    } catch (error) {
      console.error('Load projects error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  loadProjectById: async (id) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          gestionnaire:gestionnaire_id(*),
          artisan:artisan_id(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const project = transformProject(data);
      
      set(state => ({
        projects: state.projects.some(p => p.id === id)
          ? state.projects.map(p => p.id === id ? project : p)
          : [...state.projects, project],
        isLoading: false
      }));

      // Load timeline for this project
      await get().loadProjectTimeline(id);
    } catch (error) {
      console.error('Load project error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  addTimelineEntry: async (projectId, entry) => {
    try {
      const { data, error } = await supabase
        .from('project_timeline_entries')
        .insert({
          project_id: projectId,
          type: entry.type,
          message: entry.message,
          author: entry.author,
          photos: entry.photos || []
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry = transformTimelineEntry(data);

      set(state => ({
        projects: state.projects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              timeline: [...project.timeline, newEntry]
            };
          }
          return project;
        })
      }));
    } catch (error) {
      console.error('Add timeline entry error:', error);
      throw error;
    }
  },

  uploadProjectPhotos: async (projectId, phase, photos) => {
    set({ isLoading: true });
    
    try {
      // Upload files to Supabase Storage
      const photoUrls = await uploadFiles(photos, 'project-photos', `${projectId}/${phase}`);
      
      // Update project photos in database
      const { data: currentProject, error: fetchError } = await supabase
        .from('projects')
        .select(`photos_${phase}`)
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      const currentPhotos = currentProject[`photos_${phase}`] || [];
      const updatedPhotos = [...currentPhotos, ...photoUrls];

      const { error: updateError } = await supabase
        .from('projects')
        .update({ [`photos_${phase}`]: updatedPhotos })
        .eq('id', projectId);

      if (updateError) throw updateError;

      // Update local state
      set(state => ({
        projects: state.projects.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              photos: {
                ...project.photos,
                [phase]: [...project.photos[phase], ...photoUrls]
              }
            };
          }
          return project;
        }),
        isLoading: false
      }));

      // Add timeline entry
      await get().addTimelineEntry(projectId, {
        type: 'photo_upload',
        message: `Photos ${phase} ajoutées`,
        author: 'User',
        timestamp: new Date(),
        photos: photoUrls
      });
    } catch (error) {
      console.error('Upload photos error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  loadProjectTimeline: async (projectId) => {
    try {
      const { data, error } = await supabase
        .from('project_timeline_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const timeline = data.map(transformTimelineEntry);

      set(state => ({
        projects: state.projects.map(project => {
          if (project.id === projectId) {
            return { ...project, timeline };
          }
          return project;
        })
      }));
    } catch (error) {
      console.error('Load timeline error:', error);
      throw error;
    }
  },

  sendMessage: async (projectId, senderId, senderName, message, photos) => {
    set({ isLoading: true });
    
    try {
      let photoUrls: string[] = [];
      
      // Upload photos if provided
      if (photos && photos.length > 0) {
        photoUrls = await uploadFiles(photos, 'chat-photos', `${projectId}/messages`);
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          project_id: projectId,
          sender_id: senderId,
          sender_name: senderName,
          message,
          photos: photoUrls.length > 0 ? photoUrls : null
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage = transformChatMessage(data);
      
      set(state => ({
        messages: [newMessage, ...state.messages],
        isLoading: false
      }));
      
      return newMessage.id;
    } catch (error) {
      console.error('Send message error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  getMessagesByProject: (projectId) => {
    return get().messages
      .filter(message => message.projectId === projectId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  loadMessagesByProject: async (projectId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const messages = data.map(transformChatMessage);
      
      set(state => ({
        messages: [
          ...state.messages.filter(m => m.projectId !== projectId),
          ...messages
        ]
      }));
    } catch (error) {
      console.error('Load messages error:', error);
      throw error;
    }
  },

  markMessagesAsRead: async (projectId, userId) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('project_id', projectId)
        .neq('sender_id', userId);

      if (error) throw error;

      set(state => ({
        messages: state.messages.map(message => 
          message.projectId === projectId && message.senderId !== userId
            ? { ...message, isRead: true }
            : message
        )
      }));
    } catch (error) {
      console.error('Mark messages as read error:', error);
      throw error;
    }
  },

  createPaymentRequest: async (projectId, artisanId, amount, description) => {
    set({ isLoading: true });
    
    try {
      // Get project details to find gestionnaire
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('gestionnaire_id')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      const { data, error } = await supabase
        .from('payments')
        .insert({
          project_id: projectId,
          artisan_id: artisanId,
          gestionnaire_id: projectData.gestionnaire_id,
          amount,
          description
        })
        .select()
        .single();

      if (error) throw error;

      const newPayment = transformPayment(data);
      
      set(state => ({
        payments: [newPayment, ...state.payments],
        isLoading: false
      }));
      
      return newPayment.id;
    } catch (error) {
      console.error('Create payment request error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  processPayment: async (paymentId) => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      set(state => ({
        payments: state.payments.map(payment =>
          payment.id === paymentId
            ? { ...payment, status: 'completed' as PaymentStatus, processedAt: new Date() }
            : payment
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Process payment error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  getPaymentsByUser: (userId, role) => {
    return get().payments.filter(payment => 
      role === 'gestionnaire' ? payment.gestionnairId === userId : payment.artisanId === userId
    );
  },

  loadPaymentsByUser: async (userId, role) => {
    set({ isLoading: true });
    
    try {
      const column = role === 'gestionnaire' ? 'gestionnaire_id' : 'artisan_id';
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const payments = data.map(transformPayment);
      
      set({
        payments,
        isLoading: false
      });
    } catch (error) {
      console.error('Load payments error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  generateInvoice: async (paymentId) => {
    set({ isLoading: true });
    
    try {
      const payment = get().payments.find(p => p.id === paymentId);
      if (!payment) throw new Error('Payment not found');

      // For now, create a mock invoice
      // In production, this would call a Supabase Edge Function
      const invoiceNumber = `INV-${Date.now()}`;
      const taxAmount = Math.round(payment.amount * 0.2);
      const totalAmount = payment.amount + taxAmount;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          project_id: payment.projectId,
          payment_id: paymentId,
          invoice_number: invoiceNumber,
          amount: payment.amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      const newInvoice: Invoice = {
        id: data.id,
        projectId: data.project_id,
        paymentId: data.payment_id,
        invoiceNumber: data.invoice_number,
        amount: data.amount,
        taxAmount: data.tax_amount,
        totalAmount: data.total_amount,
        issueDate: new Date(data.issue_date),
        dueDate: new Date(data.due_date),
        status: data.status,
        pdfUrl: data.pdf_url
      };
      
      set(state => ({
        invoices: [newInvoice, ...state.invoices],
        isLoading: false
      }));
      
      return newInvoice.id;
    } catch (error) {
      console.error('Generate invoice error:', error);
      set({ isLoading: false });
      throw error;
    }
  }
}));