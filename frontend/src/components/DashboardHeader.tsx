import { HelpCircle, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface User {
    username: string

}

interface DashboardHeaderProps {
    user: User | null
    onShowInstructions: () => void
}
const DashboardHeader = ({ user, onShowInstructions }: DashboardHeaderProps) => {
    const { isDark, toggleTheme } = useTheme()
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Hello, {user?.username}!
                </h1>
                <p className="text-muted-foreground">Manage your plants and their care routine 🌻</p>
            </div>
            <div className="flex space-x-3 items-center">
                <button
                    onClick={toggleTheme}
                    aria-label="Toggle dark mode"
                    className="p-2 border border-border rounded-lg hover:bg-accent transition-colors bg-card"
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                    onClick={onShowInstructions}
                    className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors bg-card"
                >
                    <HelpCircle size={20} />
                    <span>Instructions</span>
                </button>
            </div>
        </div>
    )
}

export default DashboardHeader