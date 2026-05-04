import { useState, useCallback } from 'react';
import axios from '@/lib/axios';
interface UploadState {
 isLoading: boolean;
 previewUrl: string | null;
 ossUrl: string | null;
 error: string | null;
}
export function useOssUpload() {
 const [state, setState] = useState<UploadState>({
 isLoading: false,
 previewUrl: null,
 ossUrl: null,
 error: null,
 });
 const [localFile, setLocalFile] = useState<File | null>(null);
 const handleFileChange = useCallback(async (file: File) => {
 setState({
 isLoading: false,
 previewUrl: URL.createObjectURL(file),
 ossUrl: null,
 error: null,
 });
 setLocalFile(file);
 }, []);
 const uploadToOss = useCallback(async (): Promise<string | null> => {
 if (!localFile) {
 setState((prev) => ({ ...prev, error: '没有选择文件' }));
 return null;
 }
 setState((prev) => ({ ...prev, isLoading: true, error: null }));
 try {
 const { data } = await axios.post('/api/upload/oss', {
 fileName: localFile.name,
 contentType: localFile.type,
 });
 if (!data.success) {
 setState((prev) => ({ ...prev, isLoading: false, error: data.message || '获取上传URL失败' }));
 return null;
 }
 const { uploadUrl, fileUrl } = data.data;
 await fetch(uploadUrl, {
 method: 'PUT',
 body: localFile,
 headers: {
 'Content-Type': localFile.type,
 },
 });
 setState((prev) => ({ ...prev, isLoading: false, ossUrl: fileUrl }));
 return fileUrl;
 }
 catch (error) {
 console.error('上传到OSS失败:', error);
 setState((prev) => ({ ...prev, isLoading: false, error: '上传失败，请稍后重试' }));
 return null;
 }
 }, [localFile]);
 const reset = useCallback(() => {
 if (state.previewUrl) {
 URL.revokeObjectURL(state.previewUrl);
 }
 setState({
 isLoading: false,
 previewUrl: null,
 ossUrl: null,
 error: null,
 });
 setLocalFile(null);
 }, [state.previewUrl]);
 const getCurrentUrl = useCallback((): string | null => {
 return state.ossUrl || state.previewUrl;
 }, [state.ossUrl, state.previewUrl]);
 return {
 ...state,
 handleFileChange,
 uploadToOss,
 reset,
 getCurrentUrl,
 };
}

