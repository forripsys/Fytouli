import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Droplets, Leaf, Edit, Trash2, Calendar } from 'lucide-react'
import { Plant, Schedule } from '../types'
import { plantApi, scheduleApi } from '../services/api'
import toast from 'react-hot-toast'

const PlantDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [plant, setPlant] = useState<Plant | null>(null)
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPlantData = useCallback(async () => {
        try {
            const [plantData, schedulesData] = await Promise.all([
                plantApi.getById(id!),
                scheduleApi.getByPlant(id!),
            ])
            setPlant(plantData)
            setSchedules(schedulesData)
        } catch (error) {
            toast.error('Failed to load plant details')
            console.error('Plant detail error:', error)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        if (id) {
            fetchPlantData()
        }
    }, [id, fetchPlantData])


    const handleDelete = async () => {
        if (!plant) return
        if (window.confirm('Are you sure you want to delete this plant?')) {
            try {
                await plantApi.delete(plant._id)
                toast.success('Plant deleted successfully!')
                navigate('/plants')
            } catch (error) {
                toast.error('Failed to delete plant')
            }
        }
    }

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading plant details...</div>
            </div>
        )
    }

    if (!plant) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Plant not found</h3>
                <p className="text-muted-foreground mb-4">The plant you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        )
    }

    const daysSinceWatered = getDaysSinceLastWatered(plant.lastWatered)
    const daysSinceFertilized = getDaysSinceLastFertilized(plant.lastFertilized)
    const needsWater = daysSinceWatered >= plant.wateringFrequency
    const needsFertilizer = daysSinceFertilized >= plant.fertilizingFrequency

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{plant.name}</h1>
                    <p className="text-muted-foreground">{plant.species}</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate(`/plants/${plant._id}/edit`)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                        <Edit size={20} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plant Image */}
                <div className="lg:col-span-1">
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <div className="w-full h-64 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                            {plant.imageUrl ? (
                                <img
                                    src={plant.imageUrl}
                                    alt={plant.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <Leaf className="h-16 w-16 text-muted-foreground" />
                            )}
                        </div>

                    </div>
                </div>

                {/* Plant Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <h2 className="text-xl font-semibold mb-4">Plant Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                                <p className="text-foreground">{plant.location}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Pot Size</label>
                                <p className="text-foreground">{plant.potSize}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Soil Type</label>
                                <p className="text-foreground">{plant.soilType}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Light Requirements</label>
                                <p className="text-foreground capitalize">{plant.lightRequirements}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Humidity</label>
                                <p className="text-foreground capitalize">{plant.humidity}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Temperature Range</label>
                                <p className="text-foreground">{plant.temperature.min}°C - {plant.temperature.max}°C</p>
                            </div>
                        </div>
                    </div>

                    {/* Care Status */}
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <h2 className="text-xl font-semibold mb-4">Care Status</h2>
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg border ${needsWater ? 'bg-destructive/10 border-destructive/20' : 'bg-accent/20'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Droplets className={`h-5 w-5 ${needsWater ? 'text-destructive' : 'text-blue-500'}`} />
                                        <div>
                                            <p className="font-medium">Watering</p>
                                            <p className="text-sm text-muted-foreground">
                                                Every {plant.wateringFrequency} days
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${needsWater ? 'text-destructive' : 'text-foreground'}`}>
                                            {needsWater ? 'Needs water!' : `${plant.wateringFrequency - daysSinceWatered} days left`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Last: {format(new Date(plant.lastWatered), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg border ${needsFertilizer ? 'bg-destructive/10 border-destructive/20' : 'bg-accent/20'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Leaf className={`h-5 w-5 ${needsFertilizer ? 'text-destructive' : 'text-green-500'}`} />
                                        <div>
                                            <p className="font-medium">Fertilizing</p>
                                            <p className="text-sm text-muted-foreground">
                                                Every {plant.fertilizingFrequency} days
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${needsFertilizer ? 'text-destructive' : 'text-foreground'}`}>
                                            {needsFertilizer ? 'Needs fertilizer!' : `${plant.fertilizingFrequency - daysSinceFertilized} days left`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Last: {format(new Date(plant.lastFertilized), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {plant.notes && (
                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h2 className="text-xl font-semibold mb-4">Notes</h2>
                            <p className="text-foreground whitespace-pre-wrap">{plant.notes}</p>
                        </div>
                    )}

                    {/* Recent Schedules */}
                    {schedules.length > 0 && (
                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                                <Calendar className="h-5 w-5" />
                                <span>Recent Schedules</span>
                            </h2>
                            <div className="space-y-3">
                                {schedules.slice(0, 5).map((schedule) => (
                                    <div
                                        key={schedule._id}
                                        className={`p-3 rounded-lg border ${schedule.completed ? 'bg-green-50 border-green-200' : 'bg-accent/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {schedule.type === 'watering' ? (
                                                    <Droplets className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <Leaf className="h-4 w-4 text-green-500" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {schedule.type === 'watering' ? 'Watering' : 'Fertilizing'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm">
                                                    {format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')}
                                                </p>
                                                {schedule.completed && (
                                                    <p className="text-xs text-green-600">Completed</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {schedules.length > 5 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => navigate('/schedules')}
                                        className="text-primary hover:underline"
                                    >
                                        View all schedules
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PlantDetail 