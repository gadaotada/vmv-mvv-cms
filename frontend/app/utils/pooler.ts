import { axiosClient } from "./fetchClient"
type Method = 'get' | 'post' | 'put' | 'delete' | 'patch'

export const pooler = (
    url: string, 
    method: Method, 
    data: any = null, 
    interval: number = 5000,
    onData: (data: any) => void
) => {
    const poll = async () => {
        const response = await axiosClient[method](url, data);
        onData(response.data);
    };

    // Initial request
    poll();
    
    // Start polling
    const intervalId = setInterval(poll, interval);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
};


