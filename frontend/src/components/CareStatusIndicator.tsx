// CareStatusIndicator.tsx
import { Droplets, Leaf, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface CareStatusIndicatorProps {
    type: 'water' | 'fertilize'
    needsCare: boolean
    daysLeft: number
    lastCompleted?: string
}

const CareStatusIndicator = ({ type, needsCare, daysLeft, lastCompleted }: CareStatusIndicatorProps) => {
    const Icon = type === 'water' ? Droplets : Leaf
    const colorClass = needsCare ? 'text-destructive' : type === 'water' ? 'text-blue-500' : 'text-green-500'
    const bgClass = needsCare ? 'bg-destructive/10 border border-destructive/20' : 'bg-accent/20'
    const label = type === 'water' ? 'Water' : 'Fertilize'

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg ${bgClass}`}>
            <div className="flex items-center space-x-2">
                <Icon className={`h-4 w-4 ${colorClass}`} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="text-right">
                <div className={`text-sm font-medium ${needsCare ? 'text-destructive' : 'text-foreground'}`}>
                    {needsCare ? (
                        <span className="flex items-center">
                            <span className="animate-pulse">⚠️ Needs {label.toLowerCase()}!</span>
                        </span>
                    ) : (
                        <span className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                        </span>
                    )}
                </div>
                {lastCompleted && (
                    <div className="text-xs text-muted-foreground mt-1">
                        Last: {format(new Date(lastCompleted), 'MMM dd')}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CareStatusIndicator