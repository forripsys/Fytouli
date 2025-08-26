import axios from 'axios'
import { Plant, Schedule, CreatePlantData, CreateScheduleData } from '../types'

const API_BASE_URL = '/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Auth interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Plant API
export const plantApi = {
    getAll: async (): Promise<Plant[]> => {
        const response = await api.get('/plants')
        return response.data
    },

    getById: async (id: string): Promise<Plant> => {
        const response = await api.get(`/plants/${id}`)
        return response.data
    },

    create: async (data: CreatePlantData): Promise<Plant> => {
        const response = await api.post('/plants', data)
        return response.data
    },

    update: async (id: string, data: Partial<CreatePlantData>): Promise<Plant> => {
        const response = await api.put(`/plants/${id}`, data)
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/plants/${id}`)
    },

    water: async (id: string): Promise<Plant> => {
        const response = await api.post(`/plants/${id}/water`)
        return response.data
    },

    

    fertilize: async (id: string): Promise<Plant> => {
        const response = await api.post(`/plants/${id}/fertilize`)
        return response.data
    },
}

// Schedule API
export const scheduleApi = {
    getAll: async (): Promise<Schedule[]> => {
        const response = await api.get('/schedules')
        return response.data
    },

    getUpcoming: async (): Promise<Schedule[]> => {
        const response = await api.get('/schedules/upcoming')
        return response.data
    },

    getOverdue: async (): Promise<Schedule[]> => {
        const response = await api.get('/schedules/overdue')
        return response.data
    },

    getByPlant: async (plantId: string): Promise<Schedule[]> => {
        const response = await api.get(`/schedules/plant/${plantId}`)
        return response.data
    },

    create: async (data: CreateScheduleData): Promise<Schedule> => {
        const response = await api.post('/schedules', data)
        return response.data
    },

    update: async (id: string, data: Partial<CreateScheduleData>): Promise<Schedule> => {
        const response = await api.put(`/schedules/${id}`, data)
        return response.data
    },

    complete: async (id: string, notes?: string): Promise<Schedule> => {
        const response = await api.put(`/schedules/${id}/complete`, { notes })
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/schedules/${id}`)
    },

        getByDateRange: async (startDate: string, endDate: string): Promise<Schedule[]> => {
        const response = await api.get(`/schedules/range?start=${startDate}&end=${endDate}`)
        return response.data
    },
}

// Auth API
export const authApi = {
    register: async (username: string, email: string, password: string) => {
        const response = await api.post('/auth/register', { username, email, password });
        return response.data;
    },

    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data.user;
    },
};

export default api
