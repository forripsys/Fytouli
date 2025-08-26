import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { CreatePlantData } from '../types'
import { plantApi } from '../services/api'
import toast from 'react-hot-toast'

const plantSchema = z.object({
    name: z.string().min(1, 'Plant name is required'),
    species: z.string().optional().or(z.literal('')),
    location: z.string().optional().or(z.literal('')),
    potSize: z.string().optional().or(z.literal('')),
    soilType: z.string().optional().or(z.literal('')),
    lightRequirements: z.enum(['low', 'medium', 'high']),
    humidity: z.enum(['low', 'medium', 'high']),
    temperatureMin: z.number().min(-50).max(50),
    temperatureMax: z.number().min(-50).max(50),
    wateringFrequency: z.number().min(1).max(365),
    fertilizingFrequency: z.number().min(1).max(365),
    notes: z.string().optional().or(z.literal('')),
    imageUrl: z.string().url().optional().or(z.literal('')),
})

type PlantFormData = z.infer<typeof plantSchema>

const EditPlant = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PlantFormData>({
        resolver: zodResolver(plantSchema),
        defaultValues: {
            lightRequirements: 'medium',
            humidity: 'medium',
            temperatureMin: 18,
            temperatureMax: 25,
            wateringFrequency: 7,
            fertilizingFrequency: 30,
        },
    })

    useEffect(() => {
        const fetchPlant = async () => {
            if (!id) return
            try {
                const plant = await plantApi.getById(id)
                reset({
                    name: plant.name,
                    species: plant.species || '',
                    location: plant.location || '',
                    potSize: plant.potSize || '',
                    soilType: plant.soilType || '',
                    lightRequirements: plant.lightRequirements,
                    humidity: plant.humidity,
                    temperatureMin: plant.temperature.min,
                    temperatureMax: plant.temperature.max,
                    wateringFrequency: plant.wateringFrequency,
                    fertilizingFrequency: plant.fertilizingFrequency,
                    notes: plant.notes || '',
                    imageUrl: plant.imageUrl || '',
                })
            } catch (error) {
                toast.error('Failed to load plant')
                console.error('Load plant error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPlant()
    }, [id, reset])

    const onSubmit = async (data: PlantFormData) => {
        if (!id) return
        setLoading(true)
        try {
            const updateData: Partial<CreatePlantData> = {
                name: data.name,
                species: data.species || '',
                location: data.location || '',
                potSize: data.potSize || '',
                soilType: data.soilType || '',
                lightRequirements: data.lightRequirements,
                humidity: data.humidity,
                temperature: {
                    min: data.temperatureMin,
                    max: data.temperatureMax,
                },
                wateringFrequency: data.wateringFrequency,
                fertilizingFrequency: data.fertilizingFrequency,
                notes: data.notes || '',
                imageUrl: data.imageUrl || undefined,
            }

            await plantApi.update(id, updateData)
            toast.success('Plant updated successfully!')
            navigate(`/plants/${id}`)
        } catch (error) {
            toast.error('Failed to update plant')
            console.error('Update plant error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={() => navigate(`/plants/${id}`)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Edit Plant</h1>
                    <p className="text-muted-foreground">Update your plant's details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-card p-6 rounded-lg border border-border">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Plant Name *</label>
                            <input
                                {...register('name')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Monstera Deliciosa"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Species</label>
                            <input
                                {...register('species')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Monstera deliciosa"
                            />
                            {errors.species && (
                                <p className="text-sm text-destructive mt-1">{errors.species.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input
                                {...register('location')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Living room window"
                            />
                            {errors.location && (
                                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Pot Size</label>
                            <input
                                {...register('potSize')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., 6-inch pot"
                            />
                            {errors.potSize && (
                                <p className="text-sm text-destructive mt-1">{errors.potSize.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Soil Type</label>
                            <input
                                {...register('soilType')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Well-draining potting mix"
                            />
                            {errors.soilType && (
                                <p className="text-sm text-destructive mt-1">{errors.soilType.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Image URL</label>
                            <input
                                {...register('imageUrl')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://example.com/image.jpg"
                            />
                            {errors.imageUrl && (
                                <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                    <h2 className="text-lg font-semibold mb-4">Care Requirements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Light Requirements</label>
                            <select
                                {...register('lightRequirements')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="low">Low Light</option>
                                <option value="medium">Medium Light</option>
                                <option value="high">High Light</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Humidity</label>
                            <select
                                {...register('humidity')}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="low">Low Humidity</option>
                                <option value="medium">Medium Humidity</option>
                                <option value="high">High Humidity</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Temperature Range (°C) *</label>
                            <div className="flex space-x-2">
                                <input
                                    {...register('temperatureMin', { valueAsNumber: true })}
                                    type="number"
                                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Min"
                                />
                                <span className="flex items-center">to</span>
                                <input
                                    {...register('temperatureMax', { valueAsNumber: true })}
                                    type="number"
                                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Max"
                                />
                            </div>
                            {(errors.temperatureMin || errors.temperatureMax) && (
                                <p className="text-sm text-destructive mt-1">
                                    {errors.temperatureMin?.message || errors.temperatureMax?.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                    <h2 className="text-lg font-semibold mb-4">Care Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Watering Frequency (days) *</label>
                            <input
                                {...register('wateringFrequency', { valueAsNumber: true })}
                                type="number"
                                min="1"
                                max="365"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="7"
                            />
                            {errors.wateringFrequency && (
                                <p className="text-sm text-destructive mt-1">{errors.wateringFrequency.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text sm font-medium mb-2">Fertilizing Frequency (days) *</label>
                            <input
                                {...register('fertilizingFrequency', { valueAsNumber: true })}
                                type="number"
                                min="1"
                                max="365"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="30"
                            />
                            {errors.fertilizingFrequency && (
                                <p className="text-sm text-destructive mt-1">{errors.fertilizingFrequency.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                    <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
                    <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <textarea
                            {...register('notes')}
                            rows={4}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Any additional care notes or special instructions..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/plants/${id}`)}
                        className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditPlant


