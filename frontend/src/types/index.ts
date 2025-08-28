export interface Plant {
    _id: string
    name: string
    species: string
    location: string
    potSize: string
    soilType: string
    lightRequirements: 'low' | 'medium' | 'high'
    humidity: 'low' | 'medium' | 'high'
    temperature: {
        min: number
        max: number
    }
    wateringFrequency: number
    fertilizingFrequency: number
    lastWatered: string
    lastFertilized: string
    notes: string
    imageUrl?: string
    createdAt: string
    updatedAt: string
}

export interface Schedule {
    _id: string
    plant_Id: string
    plantId?: {
        name: string
        species: string
        location?: string
    }
    type: 'watering' | 'fertilizing'
    scheduledDate: string
    completed: boolean
    completedDate?: string
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface CreatePlantData {
    name: string
    species: string
    location: string
    potSize: string
    soilType: string
    lightRequirements: 'low' | 'medium' | 'high'
    humidity: 'low' | 'medium' | 'high'
    temperature: {
        min: number
        max: number
    }
    wateringFrequency: number
    fertilizingFrequency: number
    notes?: string
    imageUrl?: string
}

export interface CreateScheduleData {
    plantId: string
    type: 'watering' | 'fertilizing'
    scheduledDate: string
    notes?: string
} 

export interface User {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}