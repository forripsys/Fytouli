import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Plus, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
    children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    const location = useLocation()
    const { logout } = useAuth()

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/schedules', icon: Calendar, label: 'Schedules' },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary mb-8">🪴 Fytouli </h1>
                    

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="mt-8 pt-6 border-t border-border space-y-2">
                        <Link
                            to="/plants/add"
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={20} />
                            <span>Add Plant</span>
                        </Link>
                        
                        <button
                            onClick={logout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="ml-64 p-8">
                {children}
            </div>
        </div>
    )
}

export default Layout 