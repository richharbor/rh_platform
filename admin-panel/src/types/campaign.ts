export type CampaignType = "email";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent";

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  sender_email: string;
  sender_name: string;
  recipient_filters: any;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnsubscribedUser {
  id: string;
  email: string;
  reason: string;
  createdAt: string;
}