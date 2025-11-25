import api from './api';

interface UploadOptions {
  onProgress?: (progress: number) => void;
}

export const fileService = {
  async uploadTo(endpoint: string, file: File, options?: UploadOptions): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: any) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      }
    });
  }
};
