import axios from 'axios';


export const getAnalysis = async (file: any) => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response:any = axios.post('http://localhost:5000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response;
    } catch (error) {
        console.error('API error:', error);
    }
};