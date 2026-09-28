import { PrivateAxios } from "@/helpers/PrivateAxios";
import { Campaign, UnsubscribedUser } from "@/types/campaign";

export const campaignService = {
  async getCampaigns(): Promise<Campaign[]> {
    const res = await PrivateAxios.get("/campaigns")
    return res.data.campaigns;
  },

  async createCampaign(payload: {
    name: string;
    type: "email";
  }): Promise<Campaign> {
    const res = await PrivateAxios.post("/campaigns", payload)
    return res.data.campaign;
  },

  async deleteCampaign(id: string): Promise<void> {
    const res = await PrivateAxios.delete(`/campaigns/${id}`)
    return res.data;
  },

  async getCampaign(id: string): Promise<Campaign> {
    const res = await PrivateAxios.get(`/campaigns/${id}`)
    return res.data.campaign;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateCampaign(id: string, payload: any): Promise<void> {
    const res = await PrivateAxios.patch(`/campaigns/${id}`, payload)
    return res.data;
  },

  async scheduleCampaign(id: string, payload: {scheduled_at?: string}): Promise<void> {
    const res = await PrivateAxios.post(`/campaigns/${id}/schedule`, payload);
    return res.data;
  },

  async cancelCampaign(id: string): Promise<void> {
    const res = await PrivateAxios.post(`/campaigns/${id}/cancel`);
    return res.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async previewRecipients(id: string): Promise<any> {
    const res = await PrivateAxios.get(`/campaigns/${id}/preview`);
    return res.data;
  },

  async sendTestMail(id: string, payload:{name: string, email: string}) {
    const res = await PrivateAxios.post(`/campaigns/${id}/send-test`, payload);
    return res.data
  },

  async getUnsubscribedUsers(): Promise<UnsubscribedUser[]> {
    const res = await PrivateAxios.get(`/unsubscribe/all-unsubscribed-users`);
    return res.data.data;
  }
};
