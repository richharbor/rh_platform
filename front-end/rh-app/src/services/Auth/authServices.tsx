import { PrivateAxios } from "@/helpers/PrivateAxios";
import axios from "axios";

interface ILoginBody {
  email: string;
  password: string;
}

interface IRegisterBody {
  email: string;
  createdBy: number | null;
  password: string;
  fullName: string;
  accountType: string[];
  category: string;
  franchiseId: number | null;
  mobileNumber: string;
  location: string;
  firmName: string;
  isToken?: boolean;
}

interface IAccountInfoBody {
  name: string;
  state: string;
  aadharCard: string;
  panCard: string;
  mobile: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  country: string;
  addressState: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  zipCode: string;
}

interface IDocumentsBody {
  documents: {
    cmlCopy?: string;
    panCard?: string;
    cancelCheque?: string;
    signature?: string;
  };
}

interface IAgreementBody {
  agreementUrl: string;
}

export interface IUserProfile {
  user: {
    id: number;
    email: string;
    emailVerified: boolean;
    franchiseName: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
    isActive: boolean;
    franchiseId: number;
    tier: number;
    roles: Array<{
      id: number;
      name: string;
      isPrimary: boolean;
      permissions: string[];
    }>;
    currentRole: any;
  } | null;
  onboarding: {
    required: boolean;
    applicationId?: number;
    currentStep?: number;
    completedSteps?: number[];
    status?: string;
    requestedRole?: {
      id: number;
      name: string;
    };
    message?: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const postLogin = async (requestBody: ILoginBody) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const postStartOnboard = async (requestBody: IRegisterBody) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/onboard/start`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Start onboarding failed", error);
    throw error;
  }
};

export const postAccountInfo = async (requestBody: IAccountInfoBody) => {
  try {
    const response = await PrivateAxios.post(
      `/auth/onboard/step2`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Save account info failed", error);
    throw error;
  }
};

export const postDocuments = async (requestBody: IDocumentsBody) => {
  try {
    const response = await PrivateAxios.post(
      `/auth/onboard/step3`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Upload documents failed", error);
    throw error;
  }
};

export const postAgreement = async (requestBody: IAgreementBody) => {
  try {
    const response = await PrivateAxios.post(
      `/auth/onboard/step4`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Submit agreement failed", error);
    throw error;
  }
};

export const postBusinessInfo = async (requestBody: any) => {
  try {
    const response = await PrivateAxios.post(
      `/auth/onboard/step5`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Submit business info failed", error);
    throw error;
  }
};

export const completeOnboarding = async () => {
  try {
    const response = await PrivateAxios.post(`/auth/onboard/complete`);
    return response.data;
  } catch (error) {
    console.error("Complete onboarding failed", error);
    throw error;
  }
};

export const getOnboardingStatus = async () => {
  try {
    const response = await PrivateAxios.get(`/auth/onboard/status`);
    return response.data;
  } catch (error) {
    console.error("Get onboarding status failed", error);
    throw error;
  }
};

// export const getUserDetails = async () => {
//   try {
//     const response = await PrivateAxios.get(`${API_URL}/auth/me`);
//     return response.data;
//   } catch (error) {
//     console.error("Login failed", error);
//     throw error;
//   }
// };

export const getUserDetails = async (): Promise<IUserProfile> => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/auth/me`);
    return response.data;
  } catch (error) {
    console.error("Get profile failed", error);
    throw error;
  }
};

export const postLogout = async () => {
  try {
    const response = await PrivateAxios.post(`${API_URL}/auth/logout`);
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const getNewAccessToken = async (requestBody: any) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/auth/refresh`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const verifyOnboardingToken = async (requestBody: any) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/auth/verify-onboarding`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const verifyEmailAndSetNewPassword = async (requestBody: {
  token: string;
  tempPassword?: string;
  newPassword?: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/verify-email`,
      requestBody
    );

    return response.data;
  } catch (error) {
    console.error("Some Error occured", error);
    throw error;
  }
};

//verify partner

export const verifyPartner = async (requestBody: { token: string }) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/verify-parnter-email`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

//forgot password

export const requestPasswordReset = async (requestBody: { email: string }) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/auth/request-password-reset`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Password reset email failed:", error);
    throw error;
  }
};



export const verifyResetToken = async (requestBody: { token: string }) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/auth/verify-reset-token`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
};


export const resetPassword = async (requestBody: {
  token: string;
  newPassword: string;
}) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/auth/reset-password`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Password reset failed:", error);
    throw error;
  }
};
