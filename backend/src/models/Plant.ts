import mongoose, { Document, Schema } from 'mongoose';

export interface IPlant extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    species: string;
    location: string;
    potSize: string;
    soilType: string;
    lightRequirements: 'low' | 'medium' | 'high';
    humidity: 'low' | 'medium' | 'high';
    temperature: {
        min: number;
        max: number;
    };
    wateringFrequency: number; // days between watering
    fertilizingFrequency: number; // days between fertilizing
    lastWatered: Date;
    lastFertilized: Date;
    notes: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PlantSchema = new Schema<IPlant>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    species: {
        type: String,
        required: false,
        trim: true
    },
    location: {
        type: String,
        required: false,
        trim: true
    },
    potSize: {
        type: String,
        required: false
    },
    soilType: {
        type: String,
        required: false
    },
    lightRequirements: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: false
    },
    humidity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: false
    },
    temperature: {
        min: {
            type: Number,
            required: false
        },
        max: {
            type: Number,
            required: false
        }
    },
    wateringFrequency: {
        type: Number,
        required: false,
        min: 1
    },
    fertilizingFrequency: {
        type: Number,
        required: false,
        min: 1
    },
    lastWatered: {
        type: Date,
        default: Date.now
    },
    lastFertilized: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model<IPlant>('Plant', PlantSchema); 