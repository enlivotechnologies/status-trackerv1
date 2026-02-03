export enum UserRole {
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  SITE_VISIT_DONE = 'SITE_VISIT_DONE',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED = 'CLOSED',
  LOST = 'LOST',
}

export enum LeadSource {
  CALL = 'CALL',
  WHATSAPP = 'WHATSAPP',
  PORTAL = 'PORTAL',
  WALK_IN = 'WALK_IN',
  FACEBOOK = 'FACEBOOK',
  REFERRAL = 'REFERRAL',
  OTHER = 'OTHER',
}

export enum WorkStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum FollowUpStatus {
  PENDING = 'PENDING',
  SELECT_DATE = 'SELECT_DATE',
  COMPLETED = 'COMPLETED',
  NOT_NEGOTIABLE = 'NOT_NEGOTIABLE',
  INTERESTED = 'INTERESTED',
  FOLLOW_UP_LATER = 'FOLLOW_UP_LATER',
  NOT_RESPONDING = 'NOT_RESPONDING',
  SITE_VISIT_DONE = 'SITE_VISIT_DONE',
}

export enum CollegeStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  SEMINAR_SCHEDULED = 'SEMINAR_SCHEDULED',
  SEMINAR_DONE = 'SEMINAR_DONE',
  CONVERTED = 'CONVERTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
}

export enum CollegeFollowUpStatus {
  PENDING = 'PENDING',
  SELECT_DATE = 'SELECT_DATE',
  COMPLETED = 'COMPLETED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  INTERESTED = 'INTERESTED',
  FOLLOW_UP_LATER = 'FOLLOW_UP_LATER',
  NOT_RESPONDING = 'NOT_RESPONDING',
}

export enum SeminarStatus {
  NOT_YET_SCHEDULED = 'NOT_YET_SCHEDULED',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  project?: string;
  location?: string;
  source: LeadSource;
  status: LeadStatus;
  followUpDate: string;
  followUpStatus?: FollowUpStatus;
  assignedToId: string;
  assignedTo?: User;
  notes?: Note[];
  createdAt?: string;
  updatedAt?: string;
  // New money visibility fields
  expectedDealValue?: number;
  commissionPercentage?: number;
  expectedCommission?: number;
  lastContactedDate?: string;
  // Activity logs for owner trust
  activityLogs?: ActivityLog[];
  // Computed field for UI
  isOverdue?: boolean;
}

export interface Note {
  id: string;
  content: string;
  leadId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalLeads: number;
  followUpsToday: number;
  siteVisitsDone: number;
  dealsClosed: number;
  pendingWorks: number;
  // Money visibility stats
  totalExpectedCommission?: number;
  closedCommission?: number;
  lostCommission?: number;
  inProgressCommission?: number;
  overdueLeadsCount?: number;
  leadsNotContactedIn3Days?: number;
  // Admin-specific stats
  totalAgents?: number;
  totalLeadsGenerated?: number;
  completedLeads?: number;
  activeAgents?: number;
  averageLeadsPerAgent?: number;
  conversionRate?: number;
  followUpsCompletedToday?: number;
  leadsUpdatedToday?: number;
  newContactsToday?: number;
  activityRate?: number;
  leadsCreatedToday?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Work {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  dueDate: string;
  completedAt?: string;
  status: WorkStatus;
  assignedToId: string;
  assignedTo?: User;
  lead?: Lead;
  createdAt?: string;
  updatedAt?: string;
}

// Activity Log for tracking lead changes
export interface ActivityLog {
  id: string;
  leadId: string;
  agentId: string;
  agentName: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
}

// Agent Performance for owner view
export interface AgentPerformance {
  agentId: string;
  agentName: string;
  agentEmail: string;
  totalLeadsAssigned: number;
  overdueLeads: number;
  closedDeals: number;
  lostDeals: number;
  commissionClosed: number;
  commissionLost: number;
  inProgressCommission: number;
}

// College Management System Types
export interface College {
  id: string;
  collegeName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  seminarDate?: string;
  seminarStatus?: SeminarStatus;
  followUpDate: string;
  status: CollegeStatus;
  followUpStatus?: CollegeFollowUpStatus;
  lastContactedDate?: string;
  assignedToId: string;
  assignedTo?: User;
  notes?: CollegeNote[];
  works?: CollegeWork[];
  activityLogs?: CollegeActivityLog[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CollegeNote {
  id: string;
  content: string;
  collegeId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CollegeWork {
  id: string;
  collegeId: string;
  title: string;
  description?: string;
  dueDate: string;
  completedAt?: string;
  status: WorkStatus;
  assignedToId: string;
  assignedTo?: User;
  college?: College;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollegeActivityLog {
  id: string;
  collegeId: string;
  agentId: string;
  agentName: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
}

export interface CollegeDashboardStats {
  totalColleges: number;
  followUpsToday: number;
  seminarsScheduled: number;
  seminarsDone: number;
  converted: number;
  pendingWorks: number;
}
