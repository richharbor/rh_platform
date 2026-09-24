import { PublicAxiosForBlogs } from "../helpers/PrivateAxios";

export const fetchKnowledgeBase = async (kbId: string) => {
  try {
    const response = await PublicAxiosForBlogs.get(`/kb/${kbId}`);

    return response.data;
  } catch (error) {
    console.error("Failed to fetch analytics data", error);
    throw error;
  }
};

export const getArticle = async (articleId: string) => {
  try {
    const response = await PublicAxiosForBlogs.get(`/articles/${articleId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch analytics data", error);
    throw error;
  }
};