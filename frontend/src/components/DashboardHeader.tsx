import { HelpCircle } from 'lucide-react'

interface User {
    username: string

}

interface DashboardHeaderProps {
    user: User | null
    onShowInstructions: () => void
}
const DashboardHeader = ({ user, onShowInstructions }: DashboardHeaderProps) => {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Hello, {user?.username}!
                </h1>
                <p className="text-muted-foreground">Manage your plants and their care routine 🌻</p>
            </div>
            <div className="flex space-x-3">
                <button
                    onClick={onShowInstructions}
                    className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                    <HelpCircle size={20} />
                    <span>Instructions</span>
                </button>
            </div>
        </div>
    )
}

export default DashboardHeader