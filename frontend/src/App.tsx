import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Schedules from './pages/Schedules'
import AddPlant from './pages/AddPlant'
import PlantDetail from './pages/PlantDetail'
import EditPlant from './pages/EditPlant'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth()
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }
    
    if (!user) {
        return <Navigate to="/login" replace />
    }
    
    return <>{children}</>
}

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth()
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }
    
    if (user) {
        return <Navigate to="/" replace />
    }
    
    return <>{children}</>
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/plants/add" element={
                <ProtectedRoute>
                    <Layout>
                        <AddPlant />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/plants/:id" element={
                <ProtectedRoute>
                    <Layout>
                        <PlantDetail />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/plants/:id/edit" element={
                <ProtectedRoute>
                    <Layout>
                        <EditPlant />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/schedules" element={
                <ProtectedRoute>
                    <Layout>
                        <Schedules />
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    )
}

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AppRoutes />
            </ThemeProvider>
        </AuthProvider>
    )
}

export default App 