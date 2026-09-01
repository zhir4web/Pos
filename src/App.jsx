import { Routes, Route, Navigate } from 'react-router-dom';
import { PosProvider } from './context/PosContext';
import { UIProvider } from './context/UIContext';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorComponents';

// Pages
import PosDashboard from './pages/PosDashboard';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import CustomersDebtPage from './pages/CustomersDebtPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import SettingsPage from './pages/SettingsPage';

function App() {
    return (
        <div className="App min-h-screen bg-slate-950 font-sans" dir="rtl">
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
                <PosProvider>
                    <UIProvider>
                        <Routes>
                            <Route path="/" element={<Navigate to="/pos" replace />} />
                            <Route path="/pos" element={<PosDashboard />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/inventory" element={<InventoryPage />} />
                            <Route path="/customers" element={<CustomersDebtPage />} />
                            <Route path="/expenses" element={<ExpensesPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/ai-assistant" element={<AiAssistantPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            
                            {/* Fallbacks */}
                            <Route path="*" element={<Navigate to="/pos" replace />} />
                        </Routes>
                    </UIProvider>
                </PosProvider>
            </ErrorBoundary>
        </div>
    );
}

export default App;
