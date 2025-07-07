// Core types for Mano-Pro application
// Updated with emergency management, proposals, and enhanced data structures

export type UserRole = 'gestionnaire' | 'artisan' | 'admin';
export type ProjectStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'paid';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  role: UserRole;
  isVerified: boolean;
  isCertified?: boolean; // For artisans
  createdAt: Date;
  // Artisan specific fields
  arrondissements?: number[];
  trades?: string[];
  rating?: number;
  completedProjects?: number;
  // Profile photo
  avatar?: string;
  // Payment info
  bankDetails?: {
    iban: string;
    bic: string;
    accountHolder: string;
  };
  // Documents for artisans
  documents?: {
    id: string;
    type: string;
    name: string;
    url: string;
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: Date;
  }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type EmergencyStatus = 'open' | 'in_progress' | 'completed' | 'closed';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface Emergency {
  id: string;
  title: string;
  description: string;
  address: string;
  arrondissement: number;
  trade: string;
  maxBudget: number;
  status: EmergencyStatus;
  createdBy: string;
  createdAt: Date;
  photos: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  acceptedProposalId?: string;
}

export interface Proposal {
  id: string;
  emergencyId: string;
  artisanId: string;
  artisanName: string;
  artisanCompany: string;
  artisanRating: number;
  price: number;
  description: string;
  estimatedDuration: string;
  status: ProposalStatus;
  createdAt: Date;
}

export interface Project {
  id: string;
  emergencyId: string;
  proposalId: string;
  gestionnaire: User;
  artisan: User;
  title: string;
  description: string;
  address: string;
  price: number;
  status: ProjectStatus;
  startDate?: Date;
  completedDate?: Date;
  photos: {
    before: string[];
    during: string[];
    after: string[];
  };
  timeline: ProjectTimelineEntry[];
  rating?: number;
  review?: string;
}

export interface ProjectTimelineEntry {
  id: string;
  type: 'status_change' | 'message' | 'photo_upload' | 'payment';
  message: string;
  author: string;
  timestamp: Date;
  photos?: string[];
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  photos?: string[];
  isRead: boolean;
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

export interface Payment {
  id: string;
  projectId: string;
  artisanId: string;
  gestionnairId: string;
  amount: number;
  status: PaymentStatus;
  invoiceUrl?: string;
  createdAt: Date;
  processedAt?: Date;
  description: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  paymentId: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  pdfUrl?: string;
}

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

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Faible', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'high', label: 'Élevée', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'critical', label: 'Critique', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
];