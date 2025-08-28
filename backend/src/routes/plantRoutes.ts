import express, { Request, Response } from 'express';
import Plant from '../models/Plant';
import Schedule from '../models/Schedule';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
    user?: any;
}

const router = express.Router();

// Get all plants
router.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const plants = await Plant.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(plants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plants', error });
    }
});

// Get single plant by ID
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const plant = await Plant.findOne({ _id: req.params.id, userId: req.user._id });
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }
        res.json(plant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plant', error });
    }
});

// Create new plant
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const plantData = { ...req.body, userId: req.user._id };
        const plant = new Plant(plantData);
        const savedPlant = await plant.save();

        // Create initial schedules for the plant with proper date calculation
        const wateringDate = new Date();
        wateringDate.setDate(wateringDate.getDate() + plantData.wateringFrequency);

        const fertilizingDate = new Date();
        fertilizingDate.setDate(fertilizingDate.getDate() + plantData.fertilizingFrequency);

        // Only create schedules if they don't already exist
        const existingWateringSchedule = await Schedule.findOne({
            plantId: savedPlant._id,
            type: 'watering',
            scheduledDate: wateringDate,
            userId: req.user._id
        });

        const existingFertilizingSchedule = await Schedule.findOne({
            plantId: savedPlant._id,
            type: 'fertilizing',
            scheduledDate: fertilizingDate,
            userId: req.user._id
        });

        if (!existingWateringSchedule) {
            await Schedule.create({
                userId: req.user._id,
                plantId: savedPlant._id,
                type: 'watering',
                scheduledDate: wateringDate
            });
        }

        if (!existingFertilizingSchedule) {
            await Schedule.create({
                userId: req.user._id,
                plantId: savedPlant._id,
                type: 'fertilizing',
                scheduledDate: fertilizingDate
            });
        }

        res.status(201).json(savedPlant);
    } catch (error) {
        res.status(400).json({ message: 'Error creating plant', error });
    }
});

// Update plant
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const updatedPlant = await Plant.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedPlant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        res.json(updatedPlant);
    } catch (error) {
        res.status(400).json({ message: 'Error updating plant', error });
    }
});

// Delete plant
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const plant = await Plant.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        // Delete associated schedules
        await Schedule.deleteMany({ plantId: req.params.id, userId: req.user._id });

        res.json({ message: 'Plant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting plant', error });
    }
});

// In plantRoutes.ts - Update the water and fertilize endpoints

// Mark plant as watered
router.post('/:id/water', auth, async (req: AuthRequest, res: Response) => {
    try {
        const plant = await Plant.findOne({ _id: req.params.id, userId: req.user._id });
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        // 1. Complete any existing watering schedules for this plant
        await Schedule.updateMany(
            {
                plantId: plant._id,
                userId: req.user._id,
                type: 'watering',
                completed: false
            },
            {
                completed: true,
                completedDate: new Date(),
                notes: 'Completed via water action'
            }
        );

        // 2. Update plant's lastWatered date
        plant.lastWatered = new Date();
        await plant.save();

        // 3. Create next watering schedule (only if one doesn't already exist)
        const nextWateringDate = new Date();
        nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringFrequency);

        // Check if a schedule already exists for this date to prevent duplicates
        const existingSchedule = await Schedule.findOne({
            plantId: plant._id,
            userId: req.user._id,
            type: 'watering',
            scheduledDate: nextWateringDate
        });

        if (!existingSchedule) {
            await Schedule.create({
                userId: req.user._id,
                plantId: plant._id,
                type: 'watering',
                scheduledDate: nextWateringDate
            });
        }

        res.json(plant);
    } catch (error) {
        res.status(500).json({ message: 'Error marking plant as watered', error });
    }
});

// Mark plant as fertilized
router.post('/:id/fertilize', auth, async (req: AuthRequest, res: Response) => {
    try {
        const plant = await Plant.findOne({ _id: req.params.id, userId: req.user._id });
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }


        await Schedule.updateMany(
            {
                plantId: plant._id,
                userId: req.user._id,
                type: 'fertilizing',
                completed: false
            },
            {
                completed: true,
                completedDate: new Date(),
                notes: 'Completed via fertilize action'
            }
        );


        plant.lastFertilized = new Date();
        await plant.save();

        const nextFertilizingDate = new Date();
        nextFertilizingDate.setDate(nextFertilizingDate.getDate() + plant.fertilizingFrequency);

        const existingSchedule = await Schedule.findOne({
            plantId: plant._id,
            userId: req.user._id,
            type: 'fertilizing',
            scheduledDate: nextFertilizingDate
        });

        if (!existingSchedule) {
            await Schedule.create({
                userId: req.user._id,
                plantId: plant._id,
                type: 'fertilizing',
                scheduledDate: nextFertilizingDate
            });
        }

        res.json(plant);
    } catch (error) {
        res.status(500).json({ message: 'Error marking plant as fertilized', error });
    }
});
export default router; 