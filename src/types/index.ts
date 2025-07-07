// Core types for Mano-Pro application
// Updated to match Supabase database schema with proper field mapping

export type UserRole = 'gestionnaire' | 'artisan' | 'admin';
export type ProjectStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'paid';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type EmergencyStatus = 'open' | 'in_progress' | 'completed' | 'closed';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type TimelineEntryType = 'status_change' | 'message' | 'photo_upload' | 'payment';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface User {
  id: string;
  email: string;
  firstName: string; // Maps to first_name in DB
  lastName: string; // Maps to last_name in DB
  phone: string;
  company: string;
  role: UserRole;
  isVerified: boolean; // Maps to is_verified in DB
  isCertified?: boolean; // Maps to is_certified in DB (nullable for non-artisans)
  createdAt: Date; // Maps to created_at in DB
  // Artisan specific fields
  arrondissements?: number[]; // Array of Paris arrondissement IDs
  trades?: string[]; // Array of trade specialties
  rating?: number; // Rating from 0 to 5 (nullable)
  completedProjects?: number; // Maps to completed_projects in DB
  // Profile and payment info
  avatar?: string; // Profile photo URL (nullable)
  bankDetails?: {
    iban: string; // Maps to bank_details_iban in DB
    bic: string; // Maps to bank_details_bic in DB
    accountHolder: string; // Maps to bank_details_account_holder in DB
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Emergency {
  id: string;
  title: string;
  description: string;
  address: string;
  arrondissement: number; // Paris arrondissement (1-20)
  trade: string; // Type of work needed
  maxBudget: number; // Maps to max_budget in DB
  status: EmergencyStatus;
  createdBy: string; // Maps to created_by in DB (user ID)
  createdAt: Date; // Maps to created_at in DB
  photos: string[]; // Array of photo URLs
  urgencyLevel: UrgencyLevel; // Maps to urgency_level in DB
  acceptedProposalId?: string; // Maps to accepted_proposal_id in DB (nullable)
}

export interface Proposal {
  id: string;
  emergencyId: string; // Maps to emergency_id in DB
  artisanId: string; // Maps to artisan_id in DB
  artisanName: string; // Maps to artisan_name in DB
  artisanCompany: string; // Maps to artisan_company in DB
  artisanRating: number; // Maps to artisan_rating in DB
  price: number; // Proposed price in euros
  description: string; // Detailed proposal description
  estimatedDuration: string; // Maps to estimated_duration in DB
  status: ProposalStatus;
  createdAt: Date; // Maps to created_at in DB
}

export interface Project {
  id: string;
  emergencyId: string; // Maps to emergency_id in DB
  proposalId: string; // Maps to proposal_id in DB
  gestionnaire: User; // Full user object (joined from gestionnaire_id)
  artisan: User; // Full user object (joined from artisan_id)
  title: string;
  description: string;
  address: string;
  price: number; // Final agreed price
  status: ProjectStatus;
  startDate?: Date; // Maps to start_date in DB (nullable)
  completedDate?: Date; // Maps to completed_date in DB (nullable)
  photos: {
    before: string[]; // Maps to photos_before in DB
    during: string[]; // Maps to photos_during in DB
    after: string[]; // Maps to photos_after in DB
  };
  timeline: ProjectTimelineEntry[]; // Loaded from project_timeline_entries table
  rating?: number; // Final rating (0-5, nullable)
  review?: string; // Final review text (nullable)
}

export interface ProjectTimelineEntry {
  id: string;
  projectId?: string; // Maps to project_id in DB (not always needed in frontend)
  type: TimelineEntryType;
  message: string;
  author: string; // Name of the person who created this entry
  timestamp: Date;
  photos?: string[]; // Array of photo URLs (nullable)
}

export interface ChatMessage {
  id: string;
  projectId: string; // Maps to project_id in DB
  senderId: string; // Maps to sender_id in DB
  senderName: string; // Maps to sender_name in DB
  message: string;
  timestamp: Date;
  photos?: string[]; // Array of photo URLs (nullable)
  isRead: boolean; // Maps to is_read in DB
}

export interface Payment {
  id: string;
  projectId: string; // Maps to project_id in DB
  artisanId: string; // Maps to artisan_id in DB
  gestionnaireId: string; // Maps to gestionnaire_id in DB (fixed typo)
  amount: number; // Amount in euros (stored as integer, cents)
  status: PaymentStatus;
  invoiceUrl?: string; // Maps to invoice_url in DB (nullable)
  createdAt: Date; // Maps to created_at in DB
  processedAt?: Date; // Maps to processed_at in DB (nullable)
  description: string; // Payment description
}

export interface Invoice {
  id: string;
  projectId: string; // Maps to project_id in DB
  paymentId: string; // Maps to payment_id in DB
  invoiceNumber: string; // Maps to invoice_number in DB (unique)
  amount: number; // Base amount before tax
  taxAmount: number; // Maps to tax_amount in DB
  totalAmount: number; // Maps to total_amount in DB (amount + tax)
  issueDate: Date; // Maps to issue_date in DB
  dueDate: Date; // Maps to due_date in DB
  status: InvoiceStatus;
  pdfUrl?: string; // Maps to pdf_url in DB (nullable)
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_emergency' | 'proposal_received' | 'proposal_accepted' | 'project_update' | 'payment_received';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string; // Emergency, Project, or Proposal ID
}

// Constants for Paris arrondissements
export const PARIS_ARRONDISSEMENTS = [
  { id: 1, name: '1er - Louvre' },
  { id: 2, name: '2e - Bourse' },
  { id: 3, name: '3e - Temple' },
  { id: 4, name: '4e - Hôtel-de-Ville' },
  { id: 5, name: '5e - Panthéon' },
  { id: 6, name: '6e - Luxembourg' },
  { id: 7, name: '7e - Palais-Bourbon' },
  { id: 8, name: '8e - Élysée' },
  { id: 9, name: '9e - Opéra' },
  { id: 10, name: '10e - Entrepôt' },
  { id: 11, name: '11e - Popincourt' },
  { id: 12, name: '12e - Reuilly' },
  { id: 13, name: '13e - Gobelins' },
  { id: 14, name: '14e - Observatoire' },
  { id: 15, name: '15e - Vaugirard' },
  { id: 16, name: '16e - Passy' },
  { id: 17, name: '17e - Batignolles-Monceau' },
  { id: 18, name: '18e - Butte-Montmartre' },
  { id: 19, name: '19e - Buttes-Chaumont' },
  { id: 20, name: '20e - Ménilmontant' }
];

// Available trades/specialties
export const TRADES = [
  'Plomberie',
  'Électricité',
  'Serrurerie',
  'Couverture',
  'Chauffage',
  'Menuiserie',
  'Maçonnerie',
  'Peinture',
  'Vitrerie',
  'Climatisation'
];

// Urgency levels with display configuration
export const URGENCY_LEVELS = [
  { 
    value: 'low' as UrgencyLevel, 
    label: 'Faible', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
  },
  { 
    value: 'medium' as UrgencyLevel, 
    label: 'Moyenne', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
  },
  { 
    value: 'high' as UrgencyLevel, 
    label: 'Élevée', 
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
  },
  { 
    value: 'critical' as UrgencyLevel, 
    label: 'Critique', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
  }
];

// Helper types for database transformations
export interface DatabaseUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  role: UserRole;
  is_verified: boolean;
  is_certified: boolean | null;
  created_at: string;
  arrondissements: number[] | null;
  trades: string[] | null;
  rating: number | null;
  completed_projects: number | null;
  avatar: string | null;
  bank_details_iban: string | null;
  bank_details_bic: string | null;
  bank_details_account_holder: string | null;
}

export interface DatabaseEmergency {
  id: string;
  title: string;
  description: string;
  address: string;
  arrondissement: number;
  trade: string;
  max_budget: number;
  status: EmergencyStatus;
  created_by: string;
  created_at: string;
  photos: string[] | null;
  urgency_level: UrgencyLevel;
  accepted_proposal_id: string | null;
}

export interface DatabaseProposal {
  id: string;
  emergency_id: string;
  artisan_id: string;
  artisan_name: string;
  artisan_company: string;
  artisan_rating: number | null;
  price: number;
  description: string;
  estimated_duration: string;
  status: ProposalStatus;
  created_at: string;
}

export interface DatabaseProject {
  id: string;
  emergency_id: string;
  proposal_id: string;
  gestionnaire_id: string;
  artisan_id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  status: ProjectStatus;
  start_date: string | null;
  completed_date: string | null;
  photos_before: string[] | null;
  photos_during: string[] | null;
  photos_after: string[] | null;
  rating: number | null;
  review: string | null;
  // For joined data
  gestionnaire?: DatabaseUser;
  artisan?: DatabaseUser;
}

export interface DatabaseTimelineEntry {
  id: string;
  project_id: string;
  type: TimelineEntryType;
  message: string;
  author: string;
  timestamp: string;
  photos: string[] | null;
}

export interface DatabaseChatMessage {
  id: string;
  project_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  photos: string[] | null;
  is_read: boolean;
}

export interface DatabasePayment {
  id: string;
  project_id: string;
  artisan_id: string;
  gestionnaire_id: string;
  amount: number;
  status: PaymentStatus;
  invoice_url: string | null;
  created_at: string;
  processed_at: string | null;
  description: string;
}

export interface DatabaseInvoice {
  id: string;
  project_id: string;
  payment_id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  pdf_url: string | null;
}

// Utility functions for type transformations
export const transformDatabaseUser = (dbUser: DatabaseUser): User => ({
  id: dbUser.id,
  email: dbUser.email,
  firstName: dbUser.first_name,
  lastName: dbUser.last_name,
  phone: dbUser.phone,
  company: dbUser.company,
  role: dbUser.role,
  isVerified: dbUser.is_verified,
  isCertified: dbUser.is_certified ?? undefined,
  createdAt: new Date(dbUser.created_at),
  arrondissements: dbUser.arrondissements ?? undefined,
  trades: dbUser.trades ?? undefined,
  rating: dbUser.rating ?? undefined,
  completedProjects: dbUser.completed_projects ?? undefined,
  avatar: dbUser.avatar ?? undefined,
  bankDetails: dbUser.bank_details_iban ? {
    iban: dbUser.bank_details_iban,
    bic: dbUser.bank_details_bic || '',
    accountHolder: dbUser.bank_details_account_holder || ''
  } : undefined
});

export const transformDatabaseEmergency = (dbEmergency: DatabaseEmergency): Emergency => ({
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
  acceptedProposalId: dbEmergency.accepted_proposal_id ?? undefined
});

export const transformDatabaseProposal = (dbProposal: DatabaseProposal): Proposal => ({
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

export const transformDatabaseProject = (dbProject: DatabaseProject): Project => ({
  id: dbProject.id,
  emergencyId: dbProject.emergency_id,
  proposalId: dbProject.proposal_id,
  gestionnaire: dbProject.gestionnaire ? transformDatabaseUser(dbProject.gestionnaire) : {} as User,
  artisan: dbProject.artisan ? transformDatabaseUser(dbProject.artisan) : {} as User,
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
  timeline: [], // Loaded separately
  rating: dbProject.rating ?? undefined,
  review: dbProject.review ?? undefined
});

export const transformDatabaseTimelineEntry = (dbEntry: DatabaseTimelineEntry): ProjectTimelineEntry => ({
  id: dbEntry.id,
  type: dbEntry.type,
  message: dbEntry.message,
  author: dbEntry.author,
  timestamp: new Date(dbEntry.timestamp),
  photos: dbEntry.photos ?? undefined
});

export const transformDatabaseChatMessage = (dbMessage: DatabaseChatMessage): ChatMessage => ({
  id: dbMessage.id,
  projectId: dbMessage.project_id,
  senderId: dbMessage.sender_id,
  senderName: dbMessage.sender_name,
  message: dbMessage.message,
  timestamp: new Date(dbMessage.timestamp),
  photos: dbMessage.photos ?? undefined,
  isRead: dbMessage.is_read
});

export const transformDatabasePayment = (dbPayment: DatabasePayment): Payment => ({
  id: dbPayment.id,
  projectId: dbPayment.project_id,
  artisanId: dbPayment.artisan_id,
  gestionnaireId: dbPayment.gestionnaire_id, // Fixed typo
  amount: dbPayment.amount,
  status: dbPayment.status,
  invoiceUrl: dbPayment.invoice_url ?? undefined,
  createdAt: new Date(dbPayment.created_at),
  processedAt: dbPayment.processed_at ? new Date(dbPayment.processed_at) : undefined,
  description: dbPayment.description
});

export const transformDatabaseInvoice = (dbInvoice: DatabaseInvoice): Invoice => ({
  id: dbInvoice.id,
  projectId: dbInvoice.project_id,
  paymentId: dbInvoice.payment_id,
  invoiceNumber: dbInvoice.invoice_number,
  amount: dbInvoice.amount,
  taxAmount: dbInvoice.tax_amount,
  totalAmount: dbInvoice.total_amount,
  issueDate: new Date(dbInvoice.issue_date),
  dueDate: new Date(dbInvoice.due_date),
  status: dbInvoice.status,
  pdfUrl: dbInvoice.pdf_url ?? undefined
});