// PlantCard.tsx
import { Link } from 'react-router-dom'
import { Droplets,Leaf, Edit, Trash2 } from 'lucide-react'
import { Plant, Schedule } from '../types'
import CareStatusIndicator from './CareStatusIndicator'
import UpcomingTasks from './UpcomingTasks'
import { useState } from 'react'

interface PlantCardProps {
    plant: Plant
    upcomingSchedules: Schedule[]
    overdueSchedules: Schedule[]
    onWater: (plantId: string) => Promise<void>
    onFertilize: (plantId: string) => Promise<void>
    onDelete: (plantId: string) => void
    onCompleteSchedule: (scheduleId: string) => Promise<void> // Changed to async
}

const PlantCard = ({
    plant,
    upcomingSchedules,
    overdueSchedules,
    onWater,
    onFertilize,
    onDelete,
    onCompleteSchedule
}: PlantCardProps) => {
    const [isWatering, setIsWatering] = useState(false)
    const [isFertilizing, setIsFertilizing] = useState(false)

    const getDaysSinceLastWatered = (lastWatered: string) => {
        const lastWateredDate = new Date(lastWatered)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - lastWateredDate.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const getDaysSinceLastFertilized = (lastFertilized: string) => {
        const lastFertilizedDate = new Date(lastFertilized)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - lastFertilizedDate.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const daysSinceWatered = getDaysSinceLastWatered(plant.lastWatered)
    const daysSinceFertilized = getDaysSinceLastFertilized(plant.lastFertilized)
    const needsWater = daysSinceWatered >= plant.wateringFrequency
    const needsFertilizer = daysSinceFertilized >= plant.fertilizingFrequency

    // Calculate remaining days (ensure it doesn't go negative)
    const waterDaysLeft = Math.max(0, plant.wateringFrequency - daysSinceWatered)
    const fertilizeDaysLeft = Math.max(0, plant.fertilizingFrequency - daysSinceFertilized)

    // Check if this plant has upcoming tasks
    const plantUpcomingTasks = upcomingSchedules.filter(s => s.plant_Id === plant._id)
    const plantOverdueTasks = overdueSchedules.filter(s => s.plant_Id === plant._id)

    const handleWaterClick = async () => {
        if (isWatering) return
        setIsWatering(true)
        try {
            await onWater(plant._id)
        } finally {
            setIsWatering(false)
        }
    }

    const handleFertilizeClick = async () => {
        if (isFertilizing) return
        setIsFertilizing(true)
        try {
            await onFertilize(plant._id)
        } finally {
            setIsFertilizing(false)
        }
    }

    const handleCompleteSchedule = async (scheduleId: string) => {
        try {
            await onCompleteSchedule(scheduleId)
        } catch (error) {
            console.error('Error completing schedule:', error)
        }
    }

    return (
        <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
            <div className="flex space-x-4">
                {/* Plant Image */}
                <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-accent/50">
                        {plant.imageUrl ? (
                            <img
                                src={plant.imageUrl}
                                alt={plant.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Leaf className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Plant Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <Link to={`/plants/${plant._id}`} className="hover:underline">
                                <h3 className="text-lg font-semibold">{plant.name}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">{plant.species}</p>
                            <p className="text-sm text-muted-foreground">{plant.location}</p>
                        </div>
                        <div className="flex space-x-2">
                            <Link
                                to={`/plants/${plant._id}/edit`}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                            >
                                <Edit size={16} />
                            </Link>
                            <button
                                onClick={() => onDelete(plant._id)}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Care Status */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <CareStatusIndicator
                            type="water"
                            needsCare={needsWater}
                            daysLeft={waterDaysLeft}
                            lastCompleted={plant.lastWatered}
                        />
                        <CareStatusIndicator
                            type="fertilize"
                            needsCare={needsFertilizer}
                            daysLeft={fertilizeDaysLeft}
                            lastCompleted={plant.lastFertilized}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        <button
                            onClick={handleWaterClick}
                            disabled={isWatering}
                            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${needsWater
                                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                } ${isWatering ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Droplets size={16} />
                            <span>{isWatering ? 'Watering...' : 'Water'}</span>
                        </button>
                        <button
                            onClick={handleFertilizeClick}
                            disabled={isFertilizing}
                            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${needsFertilizer
                                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                } ${isFertilizing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Leaf size={16} />
                            <span>{isFertilizing ? 'Fertilizing...' : 'Fertilize'}</span>
                        </button>
                    </div>

                    {/* Upcoming Tasks for this plant */}
                    {(plantUpcomingTasks.length > 0 || plantOverdueTasks.length > 0) && (
                        <UpcomingTasks
                            upcomingTasks={plantUpcomingTasks}
                            overdueTasks={plantOverdueTasks}
                            onCompleteSchedule={handleCompleteSchedule}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default PlantCard