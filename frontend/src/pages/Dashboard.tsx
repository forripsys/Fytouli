import { useState, useEffect } from 'react'
import { Leaf } from 'lucide-react'
import { Plant, Schedule } from '../types'
import { plantApi, scheduleApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import InstructionsDialog from '../components/InstructionsDialog'
import SimpleCalendar from '../components/SimpleCalendar'
import DashboardHeader from '../components/DashboardHeader'
import PlantCard from '../components/PlantCard'
import EmptyState from '../components/EmptyState'

const Dashboard = () => {
    const { user } = useAuth()
    const [plants, setPlants] = useState<Plant[]>([])
    const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([])
    const [overdueSchedules, setOverdueSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(true)
    const [showInstructions, setShowInstructions] = useState(false)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [plantsData, upcomingData, overdueData] = await Promise.all([
                    plantApi.getAll(),
                    scheduleApi.getUpcoming(),
                    scheduleApi.getOverdue(),
                ])

                setPlants(plantsData)
                setUpcomingSchedules(upcomingData)
                setOverdueSchedules(overdueData)
            } catch (error) {
                toast.error('Failed to load dashboard data')
                console.error('Dashboard error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const handleCompleteSchedule = async (scheduleId: string) => {
        try {
            await scheduleApi.complete(scheduleId)
            const [upcomingData, overdueData] = await Promise.all([
                scheduleApi.getUpcoming(),
                scheduleApi.getOverdue(),
            ])
            setUpcomingSchedules(upcomingData)
            setOverdueSchedules(overdueData)
            toast.success('Task completed!')
        } catch (error) {
            toast.error('Failed to complete task')
        }
    }

    const handleWater = async (plantId: string) => {
        try {
            await plantApi.water(plantId)
            // Force a complete refresh of all data
            await refreshAllData()
            toast.success('Plant watered successfully!')
        } catch (error) {
            toast.error('Failed to water plant')
            throw error
        }
    }

    const handleFertilize = async (plantId: string) => {
        try {
            await plantApi.fertilize(plantId)
            // Force a complete refresh of all data
            await refreshAllData()
            toast.success('Plant fertilized successfully!')
        } catch (error) {
            toast.error('Failed to fertilize plant')
            throw error
        }
    }

    // Add this helper function
    const refreshAllData = async () => {
        try {
            const [plantsData, upcomingData, overdueData] = await Promise.all([
                plantApi.getAll(),
                scheduleApi.getUpcoming(),
                scheduleApi.getOverdue(),
            ])
            setPlants(plantsData)
            setUpcomingSchedules(upcomingData)
            setOverdueSchedules(overdueData)
        } catch (error) {
            console.error('Error refreshing data:', error)
            toast.error('Failed to refresh data')
        }
    }

    const handleDelete = async (plantId: string) => {
        if (window.confirm('Are you sure you want to delete this plant?')) {
            try {
                await plantApi.delete(plantId)
                const [plantsData, upcomingData, overdueData] = await Promise.all([
                    plantApi.getAll(),
                    scheduleApi.getUpcoming(),
                    scheduleApi.getOverdue(),
                ])
                setPlants(plantsData)
                setUpcomingSchedules(upcomingData)
                setOverdueSchedules(overdueData)
                toast.success('Plant deleted successfully!')
            } catch (error) {
                toast.error('Failed to delete plant')
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <DashboardHeader
                user={user}
                onShowInstructions={() => setShowInstructions(true)}
            />

            {/* Total Plants Count */}
            <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                    <Leaf className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Total Plants</p>
                        <p className="text-2xl font-bold">{plants.length}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plants Section */}
                <div className="lg:col-span-2">
                    {plants.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4">
                            {plants.map((plant) => (
                                <PlantCard
                                    key={plant._id}
                                    plant={plant}
                                    upcomingSchedules={upcomingSchedules}
                                    overdueSchedules={overdueSchedules}
                                    onWater={handleWater}
                                    onFertilize={handleFertilize}
                                    onDelete={handleDelete}
                                    onCompleteSchedule={handleCompleteSchedule}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Calendar Section */}
                <div className="lg:col-span-1">
                    <SimpleCalendar onScheduleComplete={handleCompleteSchedule} />

                </div>
            </div>

            {/* Instructions Dialog */}
            <InstructionsDialog
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
            />
        </div>
    )
}

export default Dashboard