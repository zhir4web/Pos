import { Routes, Route, Navigate } from 'react-router-dom'
import PosDashboard from './pages/PosDashboard'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'
import { SalesProvider } from './context/SalesContext'
import SettingsPage from './pages/SettingsPage'

import { UIProvider } from './context/UIContext'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from './components/ErrorComponents'

function App() {
    return (
        <div className="App">
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
                <UIProvider>
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
                </UIProvider>
            </ErrorBoundary>
        </div>
    )
}

export default App
