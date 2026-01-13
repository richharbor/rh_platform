// src/types/index.ts
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  emailVerified: boolean;
}

export interface RequestedRole {
  id: number;
  name: string;
}

export interface FormDataStep1 {
  email: string;
  fullName: string;
  accountType: string;
}

export interface FormDataStep2 {
  city: string;
  name: string;
  state: string;
  mobile: string;
  country: string;
  panCard: string;
  zipCode: string;
  bankName: string;
  ifscCode: string;
  aadharCard: string;
  addressLine1: string;
  addressLine2: string;
  addressState: string;
  accountNumber: string;
}

export interface FormData {
  step1?: FormDataStep1;
  step2?: FormDataStep2;
  systemGenerated?: boolean;
}

export interface Documents {
  cmlCopy?: string;
  panCard?: string;
  signature?: string;
  cancelCheque?: string;
  agreement?: string;
}

export interface PartnerApplication {
  id: number;
  userId: number;
  requestedRoleId: number;
  currentStep: number;
  completedSteps: number[];
  formData: FormData;
  documents: Documents;
  status: 'draft' | 'approved' | 'rejected' | 'pending';
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  approvalToken: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  requestedRole: RequestedRole;
}

export interface ApiResponse {
  applications: PartnerApplication[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PartnerRow {
  id: number;
  name: string;
  email: string;
  state: string;
  role: string;
  registrationStep: number;
  status: string;
  createdAt: string;
}
