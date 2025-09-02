import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import { Droplets, Leaf } from 'lucide-react'
import { Schedule } from '../types'
import { scheduleApi } from '../services/api'

interface SimpleCalendarProps {
    refreshKey?: number;
    onScheduleComplete?: (scheduleId: string) => Promise<void>;
}

const SimpleCalendar = ({
    refreshKey
}: SimpleCalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchSchedulesForMonth();
    }, [currentDate, refreshKey]);

    // Fetch schedules for the current month
    const fetchSchedulesForMonth = async () => {
        setLoading(true)
        try {
            const start = startOfMonth(currentDate)
            const end = endOfMonth(currentDate)

            const schedulesData = await scheduleApi.getByDateRange(
                format(start, 'yyyy-MM-dd'),
                format(end, 'yyyy-MM-dd')
            )

            setSchedules(schedulesData)
        } catch (error) {
            console.error('Error fetching schedules:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedulesForMonth()
    }, [currentDate])

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const getSchedulesForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return schedules.filter(schedule =>
            format(new Date(schedule.scheduledDate), 'yyyy-MM-dd') === dateStr && !schedule.completed
        )
    }


    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        // use theme-aware card background so dark mode applies
        days.push(<div key={`empty-${i}`} className="h-28 border border-border rounded-md bg-card"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        const daySchedules = getSchedulesForDate(date)
        const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        const isHovered = hoveredDate && format(hoveredDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        const isFuture = date > new Date()

        days.push(
            <div
                key={day}
                className={`h-28 border border-border p-2 relative cursor-pointer transition-all rounded-md bg-card ${isToday ? 'ring-1 ring-primary/20' : ''} ${isHovered ? 'bg-accent/10 shadow-md' : ''} ${isSelected ? 'ring-2 ring-primary' : ''} ${isFuture ? 'opacity-90' : ''}`}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => setSelectedDate(date)}
            >
                <div className="text-sm font-medium mb-1">{day}</div>
                <div className="space-y-1">
                    {daySchedules.slice(0, 2).map((schedule) => (
                        <div
                            key={schedule._id}
                            title={`${schedule.plantId?.name} - ${schedule.type}`}
                            className={
                                schedule.type === 'watering'
                                    ? 'truncate text-xs rounded-full px-2 py-1 inline-block max-w-full overflow-hidden whitespace-nowrap bg-blue-200 text-blue-800 dark:bg-blue-400 dark:text-black'
                                    : 'truncate text-xs rounded-full px-2 py-1 inline-block max-w-full overflow-hidden whitespace-nowrap bg-green-200 text-green-800 dark:bg-green-400 dark:text-black'
                            }
                        >
                            {schedule.plantId?.name?.slice(0, 12)}
                        </div>
                    ))}
                    {daySchedules.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                            +{daySchedules.length - 2} more
                        </div>
                    )}
                </div>

                {/* Hover tooltip */}
                {isHovered && daySchedules.length > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 bg-card border border-border rounded-lg shadow-lg p-3 min-w-48">
                        <div className="text-sm font-medium mb-2">
                            {format(date, 'dd MMM yyyy')}
                        </div>
                        <div className="space-y-1">
                            {daySchedules.map((schedule) => (
                                <div key={schedule._id} className="flex items-center space-x-2 text-sm">
                                    {schedule.type === 'watering' ? (
                                        <Droplets className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <Leaf className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className="font-medium">{schedule.plantId?.name}</span>
                                    <span className="text-muted-foreground">
                                        - {schedule.type === 'watering' ? 'Watering' : 'Fertilizing'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : []

    const navigateToMonth = (months: number) => {
        setCurrentDate(addMonths(currentDate, months))
        setSelectedDate(null)
    }

    const goToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(null)
    }

    if (loading) {
        return (
            <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading calendar...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex justify-between items-center mb-4">
                {/* <h2 className="text-xl font-semibold">Calendar</h2> */}
                <div className="flex space-x-2 items-center">
                    <button
                        onClick={() => navigateToMonth(-1)}
                        className="px-3 py-1 text-sm border border-border rounded hover:bg-accent"
                    >
                        ←
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button
                        onClick={() => navigateToMonth(1)}
                        className="px-3 py-1 text-sm border border-border rounded hover:bg-accent"
                    >
                        →
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 text-sm border border-border rounded hover:bg-accent ml-2"
                    >
                        Today
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>

            {/* Selected date details */}
            {selectedDate && selectedDateSchedules.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-medium mb-2">
                        Tasks for {format(selectedDate, 'MMM dd, yyyy')}
                    </h3>
                    <div className="space-y-2">
                        {selectedDateSchedules.map((schedule) => (
                            <div key={schedule._id} className="flex items-center justify-between p-2 bg-accent/50 rounded text-sm">
                                <div className="flex items-center space-x-2">
                                    {schedule.type === 'watering' ? (
                                        <Droplets className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <Leaf className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className="font-medium text-wrap ">{schedule.plantId?.name}</span>
                                    <span className="text-muted-foreground">
                                        - {schedule.type === 'watering' ? 'Watering' : 'Fertilizing'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedDate && selectedDateSchedules.length === 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                        No tasks scheduled for {format(selectedDate, 'dd MMM yyyy')} 🌞
                    </p>
                </div>
            )}

        </div>
    )
}

export default SimpleCalendar