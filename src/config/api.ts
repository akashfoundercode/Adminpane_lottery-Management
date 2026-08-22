export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://test.hashoster.co.in';

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
