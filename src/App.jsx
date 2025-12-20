import { Routes, Route, Navigate } from 'react-router-dom'
import PosDashboard from './pages/PosDashboard'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'
import { SalesProvider } from './context/SalesContext'
import SettingsPage from './pages/SettingsPage'

function App() {
    return (
        <div className="App">
            <SalesProvider>
                <Routes>
                    {/* Redirect root to /pos since it's the main app now */}
                    <Route path="/" element={<Navigate to="/pos" replace />} />

                    <Route path="/pos" element={<PosDashboard />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/reports" element={<ReportsPage />} />

                    {/* Fallback for implementation completeness */}
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/demo" element={<Navigate to="/pos" replace />} />
                </Routes>
            </SalesProvider>
        </div>
    )
}

export default App
