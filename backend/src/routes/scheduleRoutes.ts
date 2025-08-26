import express, { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import Plant from '../models/Plant';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
    user?: any;
}

const router = express.Router();

// Get all schedules
router.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const schedules = await Schedule.find({ userId: req.user._id })
            .populate('plantId', 'name species location')
            .sort({ scheduledDate: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules', error });
    }
});

// Get schedules for a specific plant
router.get('/plant/:plantId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const schedules = await Schedule.find({ 
            plantId: req.params.plantId, 
            userId: req.user._id 
        })
            .populate('plantId', 'name species')
            .sort({ scheduledDate: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plant schedules', error });
    }
});

// Get upcoming schedules (next 7 days)
router.get('/upcoming', auth, async (req: AuthRequest, res: Response) => {
    try {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const schedules = await Schedule.find({
            userId: req.user._id,
            scheduledDate: { $lte: sevenDaysFromNow },
            completed: false
        })
            .populate('plantId', 'name species location')
            .sort({ scheduledDate: 1 });

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching upcoming schedules', error });
    }
});

// Get overdue schedules
router.get('/overdue', auth, async (req: AuthRequest, res: Response) => {
    try {
        const schedules = await Schedule.find({
            userId: req.user._id,
            scheduledDate: { $lt: new Date() },
            completed: false
        })
            .populate('plantId', 'name species location')
            .sort({ scheduledDate: 1 });

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching overdue schedules', error });
    }
});

// Get schedules by date range
router.get('/range', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { start, end } = req.query;
        
        if (!start || !end) {
            return res.status(400).json({ message: 'Start and end dates are required' });
        }

        const startDate = new Date(start as string);
        const endDate = new Date(end as string);

        const schedules = await Schedule.find({
            userId: req.user._id,
            scheduledDate: { $gte: startDate, $lte: endDate }
        })
        .populate('plantId', 'name species location')
        .sort({ scheduledDate: 1 });

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules by date range', error });
    }
});

// Mark schedule as completed
router.put('/:id/complete', auth, async (req: AuthRequest, res: Response) => {
    try {
        const schedule = await Schedule.findOne({ _id: req.params.id, userId: req.user._id });
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        schedule.completed = true;
        schedule.completedDate = new Date();
        schedule.notes = req.body.notes || schedule.notes;

        const updatedSchedule = await schedule.save();

        // Update the plant's last watered/fertilized date
        const plant = await Plant.findOne({ _id: schedule.plantId, userId: req.user._id });
        if (plant) {
            if (schedule.type === 'watering') {
                plant.lastWatered = new Date();
            } else if (schedule.type === 'fertilizing') {
                plant.lastFertilized = new Date();
            }
            await plant.save();
        }

        res.json(updatedSchedule);
    } catch (error) {
        res.status(500).json({ message: 'Error completing schedule', error });
    }
});

// Create a new schedule
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        // Check if a similar schedule already exists within a 2-day window
        const scheduledDate = new Date(req.body.scheduledDate);
        const dayBefore = new Date(scheduledDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        const dayAfter = new Date(scheduledDate);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const existingSchedule = await Schedule.findOne({
            plantId: req.body.plantId,
            type: req.body.type,
            scheduledDate: { $gte: dayBefore, $lte: dayAfter },
            userId: req.user._id,
            completed: false
        });

        if (existingSchedule) {
            return res.status(400).json({ 
                message: 'A similar schedule already exists for this time period' 
            });
        }

        const scheduleData = { ...req.body, userId: req.user._id };
        const schedule = new Schedule(scheduleData);
        const savedSchedule = await schedule.save();

        const populatedSchedule = await Schedule.findById(savedSchedule._id)
            .populate('plantId', 'name species');

        res.status(201).json(populatedSchedule);
    } catch (error) {
        res.status(400).json({ message: 'Error creating schedule', error });
    }
});

// Update schedul
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const updatedSchedule = await Schedule.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        ).populate('plantId', 'name species');

        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.json(updatedSchedule);
    } catch (error) {
        res.status(400).json({ message: 'Error updating schedule', error });
    }
});

// Delete schedule
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting schedule', error });
    }
});

export default router; 

 
