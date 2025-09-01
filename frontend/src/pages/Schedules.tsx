import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Droplets, Leaf, Calendar, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { Schedule } from '../types'
import { scheduleApi } from '../services/api'
import toast from 'react-hot-toast'

const Schedules = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchSchedules()
    }, [])

    const fetchSchedules = async () => {
        try {
            const data = await scheduleApi.getAll()
            setSchedules(data)
        } catch (error) {
            toast.error('Failed to load schedules')
            console.error('Schedules error:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchSchedules()
    }

    const handleCompleteSchedule = async (scheduleId: string) => {
        try {
            await scheduleApi.complete(scheduleId)
            // Refresh schedules to show the newly created next schedule
            await fetchSchedules()
            toast.success('Task completed! New schedule created!')
        } catch (error) {
            toast.error('Failed to complete task')
        }
    }

    const handleDelete = async (scheduleId: string) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                await scheduleApi.delete(scheduleId)
                await fetchSchedules()
                toast.success('Schedule deleted successfully!')
            } catch (error) {
                toast.error('Failed to delete schedule')
            }
        }
    }

    const filteredSchedules = schedules.filter((schedule) => {
        const isOverdue = new Date(schedule.scheduledDate) < new Date() && !schedule.completed
        const isUpcoming = new Date(schedule.scheduledDate) >= new Date() && !schedule.completed

        switch (filter) {
            case 'upcoming':
                return isUpcoming
            case 'overdue':
                return isOverdue
            case 'completed':
                return schedule.completed
            default:
                return true
        }
    })

    const getScheduleStatus = (schedule: Schedule) => {
        if (schedule.completed) {
            return { status: 'completed', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' }
        }

        const isOverdue = new Date(schedule.scheduledDate) < new Date()
        if (isOverdue) {
            return { status: 'overdue', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' }
        }

        return { status: 'upcoming', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading schedules...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Schedules</h1>
                    <p className="text-muted-foreground">Manage your plant care schedules</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 border-b border-border">
                {[
                    { key: 'all', label: 'All', count: schedules.length },
                    { key: 'upcoming', label: 'Upcoming', count: schedules.filter(s => new Date(s.scheduledDate) >= new Date() && !s.completed).length },
                    { key: 'overdue', label: 'Overdue', count: schedules.filter(s => new Date(s.scheduledDate) < new Date() && !s.completed).length },
                    { key: 'completed', label: 'Completed', count: schedules.filter(s => s.completed).length },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as 'all' | 'upcoming' | 'overdue' | 'completed')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === tab.key
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {filteredSchedules.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
                    <p className="text-muted-foreground">
                        {filter === 'all' && 'No schedules have been created yet.'}
                        {filter === 'upcoming' && 'No upcoming schedules.'}
                        {filter === 'overdue' && 'No overdue schedules.'}
                        {filter === 'completed' && 'No completed schedules.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSchedules.map((schedule) => {
                        const status = getScheduleStatus(schedule)

                        return (
                            <div
                                key={schedule._id}
                                className={`p-6 rounded-lg border ${status.bg} ${status.border}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-lg ${status.bg}`}>
                                            {schedule.type === 'watering' ? (
                                                <Droplets className={`h-6 w-6 ${status.color}`} />
                                            ) : (
                                                <Leaf className={`h-6 w-6 ${status.color}`} />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="font-semibold">{schedule.plantId?.name}</h3>
                                                <span className="text-sm text-muted-foreground">({schedule.plantId?.species})</span>
                                                {schedule.completed && (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                )}
                                                {status.status === 'overdue' && (
                                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">
                                                        {schedule.type === 'watering' ? 'Watering' : 'Fertilizing'}
                                                    </span>
                                                    {' - '}
                                                    {format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')}
                                                </p>

                                                {schedule.plantId?.location && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Location: {schedule.plantId.location}
                                                    </p>
                                                )}

                                                {schedule.notes && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Notes: {schedule.notes}
                                                    </p>
                                                )}

                                                {schedule.completed && schedule.completedDate && (
                                                    <p className="text-sm text-green-600">
                                                        Completed: {format(new Date(schedule.completedDate), 'MMM dd, yyyy')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        {!schedule.completed && (
                                            <button
                                                onClick={() => handleCompleteSchedule(schedule._id)}
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(schedule._id)}
                                            className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Schedules