import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
    userId: mongoose.Types.ObjectId;
    plantId: mongoose.Types.ObjectId;
    type: 'watering' | 'fertilizing';
    scheduledDate: Date;
    completed: boolean;
    completedDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plantId: {
        type: Schema.Types.ObjectId,
        ref: 'Plant',
        required: true
    },
    type: {
        type: String,
        enum: ['watering', 'fertilizing'],
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedDate: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
ScheduleSchema.index({ plantId: 1, scheduledDate: 1 });
ScheduleSchema.index({ completed: 1, scheduledDate: 1 });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema); 