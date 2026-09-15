export type Role = 'Admin' | 'Manager' | 'Agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitial: string;
  phone?: string;
  title?: string;
}

export type ClientCategory = 'Buyer' | 'Seller' | 'Landlord' | 'Tenant' | 'Investor';

export type PipelineStageId = string;

export interface PipelineStage {
  id: PipelineStageId;
  name: string;
  order: number;
}

export type DealStatus = 'Active' | 'Under Offer' | 'Won' | 'Lost' | 'On Hold';

export type CustomFieldType = 'text' | 'number' | 'date' | 'select';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  placeholder?: string;
}

export interface FinancialRecord {
  id: string;
  description: string;
  type: 'Deposit' | 'Commission' | 'Listing Fee' | 'Transfer Tax' | 'Escrow' | 'Legal Fee';
  amountAED: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  invoiceNumber: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'In-Person' | 'Video Call' | 'Site Visit' | 'Contract Signing';
  agentName: string;
  notes: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'IMAGE' | 'SCAN';
  size: string;
  uploadedDate: string;
  status: 'Verified' | 'Pending Review' | 'Signed';
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  location: string;
  registeredAddress: string;
  category: ClientCategory;
  stageId: PipelineStageId;
  dealStatus: DealStatus;
  dealValueAED: number;
  assignedAgentId: string;
  assignedAgentName: string;
  dateJoined: string;
  expectedClosingDate?: string;
  notes?: string;
  customFields: Record<string, string | number>;
  financials: FinancialRecord[];
  meetings: Meeting[];
  documents: DocumentRecord[];
}

export interface ClientFilters {
  search?: string;
  category?: ClientCategory | 'All';
  stageId?: string | 'All';
  assignedAgentId?: string;
}

export interface ClientStats {
  totalClients: number;
  activeDeals: number;
  closedThisMonth: number;
  totalPipelineAED: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: string;
}

export interface BrokerageSettings {
  pipelineStages: PipelineStage[];
  customFields: CustomFieldDefinition[];
  emailTemplate: EmailTemplate;
}
