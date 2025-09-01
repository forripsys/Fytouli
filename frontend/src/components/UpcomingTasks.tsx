import { format } from 'date-fns'
import { Droplets, Leaf } from 'lucide-react'
import { Schedule } from '../types'

interface UpcomingTasksProps {
    upcomingTasks: Schedule[]
    overdueTasks: Schedule[]
    onCompleteSchedule: (scheduleId: string) => Promise<void> // Changed to async
}

const UpcomingTasks = ({ upcomingTasks, overdueTasks, onCompleteSchedule }: UpcomingTasksProps) => {
    const handleComplete = async (scheduleId: string) => {
        try {
            await onCompleteSchedule(scheduleId)
        } catch (error) {
            console.error('Error completing schedule:', error)
        }
    }

    return (
        <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">Upcoming Tasks:</p>
            <div className="space-y-1">
                {overdueTasks.map((schedule) => (
                    <div key={schedule._id} className="flex items-center justify-between p-2 bg-destructive/10 rounded text-sm">
                        <div className="flex items-center space-x-2">
                            {schedule.type === 'watering' ? (
                                <Droplets className="h-3 w-3 text-destructive" />
                            ) : (
                                <Leaf className="h-3 w-3 text-destructive" />
                            )}
                            <span className="text-destructive font-medium">
                                {schedule.type === 'watering' ? 'Watering' : 'Fertilizing'} - OVERDUE
                            </span>
                        </div>
                        <button
                            onClick={() => handleComplete(schedule._id)}
                            className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
                        >
                            Complete
                        </button>
                    </div>
                ))}
                {upcomingTasks.slice(0, 2).map((schedule) => (
                    <div key={schedule._id} className="flex items-center justify-between p-2 bg-accent/50 rounded text-sm">
                        <div className="flex items-center space-x-2">
                            {schedule.type === 'watering' ? (
                                <Droplets className="h-3 w-3 text-blue-500" />
                            ) : (
                                <Leaf className="h-3 w-3 text-green-500" />
                            )}
                            <span>
                                {schedule.type === 'watering' ? 'Watering' : 'Fertilizing'} - {format(new Date(schedule.scheduledDate), 'MMM dd')}
                            </span>
                        </div>
                        <button
                            onClick={() => handleComplete(schedule._id)}
                            className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
                        >
                            Complete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UpcomingTasks