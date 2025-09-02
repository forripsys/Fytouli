// PlantCard.tsx
import { Link } from 'react-router-dom'
import { Leaf, Edit, Trash2 } from 'lucide-react'
import { Plant, Schedule } from '../types'
import CareStatusIndicator from './CareStatusIndicator'

interface PlantCardProps {
    plant: Plant
    upcomingSchedules: Schedule[]
    overdueSchedules: Schedule[]
    onDelete: (plantId: string) => void
}

const PlantCard = ({
    plant,
    onDelete,
}: PlantCardProps) => {


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

    // // Check if this plant has upcoming tasks
    // const plantUpcomingTasks = upcomingSchedules.filter(s => s.plant_Id === plant._id)
    // const plantOverdueTasks = overdueSchedules.filter(s => s.plant_Id === plant._id)


    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-soft hover:shadow-lg transition-shadow">
            <div className="flex space-x-4">
                {/* Plant Image */}
                <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-accent/20">
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
                </div>
            </div>
        </div>
    )
}

export default PlantCard