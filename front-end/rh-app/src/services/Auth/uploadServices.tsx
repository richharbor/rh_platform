import { PrivateAxios, PrivateFilesAxios } from "@/helpers/PrivateAxios";

export interface FileDelete {
  key: string;
}

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
}

export const deleteDocumentFile = async (requestbody: FileDelete) => {
  const response = await PrivateAxios.delete(`/upload/documents`, {
    data: requestbody,
  });
  return response.data;
};

export const uploadDocumentFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await PrivateFilesAxios.post("/upload/documents", formData);
  return response.data;
};
