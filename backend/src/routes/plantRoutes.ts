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

        // Create initial schedules for the plant with proper date calculation from TODAY
        const wateringDate = new Date();
        wateringDate.setDate(wateringDate.getDate() + plantData.wateringFrequency);

        const fertilizingDate = new Date();
        fertilizingDate.setDate(fertilizingDate.getDate() + plantData.fertilizingFrequency);

        // Only create schedules if they don't already exist (check by date range)
        const existingWateringSchedule = await Schedule.findOne({
            plantId: savedPlant._id,
            type: 'watering',
            scheduledDate: {
                $gte: new Date(wateringDate.getFullYear(), wateringDate.getMonth(), wateringDate.getDate()),
                $lt: new Date(wateringDate.getFullYear(), wateringDate.getMonth(), wateringDate.getDate() + 1)
            },
            userId: req.user._id
        });

        const existingFertilizingSchedule = await Schedule.findOne({
            plantId: savedPlant._id,
            type: 'fertilizing',
            scheduledDate: {
                $gte: new Date(fertilizingDate.getFullYear(), fertilizingDate.getMonth(), fertilizingDate.getDate()),
                $lt: new Date(fertilizingDate.getFullYear(), fertilizingDate.getMonth(), fertilizingDate.getDate() + 1)
            },
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
    const existing = await Plant.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existing) return res.status(404).json({ message: 'Plant not found' });

    const wateringChanged =
      typeof req.body.wateringFrequency === 'number' &&
      req.body.wateringFrequency !== existing.wateringFrequency;

    const fertilizingChanged =
      typeof req.body.fertilizingFrequency === 'number' &&
      req.body.fertilizingFrequency !== existing.fertilizingFrequency;

    const updatedPlant = await Plant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (wateringChanged) {
      // remove any future, incomplete watering schedules
      await Schedule.deleteMany({
        plantId: updatedPlant!._id,
        userId: req.user._id,
        type: 'watering',
        completed: false,
        scheduledDate: { $gte: startOfToday },
      });
      // create next based on new frequency
      const next = new Date();
      next.setDate(next.getDate() + updatedPlant!.wateringFrequency);
      await Schedule.create({
        userId: req.user._id,
        plantId: updatedPlant!._id,
        type: 'watering',
        scheduledDate: next,
      });
    }

    if (fertilizingChanged) {
      await Schedule.deleteMany({
        plantId: updatedPlant!._id,
        userId: req.user._id,
        type: 'fertilizing',
        completed: false,
        scheduledDate: { $gte: startOfToday },
      });
      const next = new Date();
      next.setDate(next.getDate() + updatedPlant!.fertilizingFrequency);
      await Schedule.create({
        userId: req.user._id,
        plantId: updatedPlant!._id,
        type: 'fertilizing',
        scheduledDate: next,
      });
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

        // 3. Create next watering schedule based on frequency from TODAY
        const nextWateringDate = new Date();
        nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringFrequency);

        // Check if a schedule already exists for this date (whole day range)
        const existingSchedule = await Schedule.findOne({
            plantId: plant._id,
            userId: req.user._id,
            type: 'watering',
            scheduledDate: {
                $gte: new Date(nextWateringDate.getFullYear(), nextWateringDate.getMonth(), nextWateringDate.getDate()),
                $lt: new Date(nextWateringDate.getFullYear(), nextWateringDate.getMonth(), nextWateringDate.getDate() + 1)
            }
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

        // 1. Complete any existing fertilizing schedules for this plant
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

        // 2. Update plant's lastFertilized date
        plant.lastFertilized = new Date();
        await plant.save();

        // 3. Create next fertilizing schedule based on frequency from TODAY
        const nextFertilizingDate = new Date();
        nextFertilizingDate.setDate(nextFertilizingDate.getDate() + plant.fertilizingFrequency);

        // Check if a schedule already exists for this date (whole day range)
        const existingSchedule = await Schedule.findOne({
            plantId: plant._id,
            userId: req.user._id,
            type: 'fertilizing',
            scheduledDate: {
                $gte: new Date(nextFertilizingDate.getFullYear(), nextFertilizingDate.getMonth(), nextFertilizingDate.getDate()),
                $lt: new Date(nextFertilizingDate.getFullYear(), nextFertilizingDate.getMonth(), nextFertilizingDate.getDate() + 1)
            }
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