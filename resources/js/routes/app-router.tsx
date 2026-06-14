import Root from '@/layout/layout';
import Dashboard from '@/pages/dashboard';
import AccountPage from '@/pages/portal/account-page';
import PortalResourcePage from '@/pages/portal/resource-page';
import SettingsPage from '@/pages/portal/settings-page';
import { Navigate, Route, Routes } from 'react-router-dom';

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Root />}>
                <Route index element={<Dashboard />} />
                <Route path="portal/:resource" element={<PortalResourcePage />} />
                <Route path="portal/:resource/create" element={<PortalResourcePage />} />
                <Route path="portal/:resource/:id/edit" element={<PortalResourcePage />} />
                <Route path="portal/:resource/:id/show" element={<PortalResourcePage />} />
                <Route path="portal/:resource/:id/delete" element={<PortalResourcePage />} />
                <Route path="portal/profile" element={<AccountPage />} />
                <Route path="portal/aboutme" element={<Navigate to="/portal/profile" replace />} />
                <Route path="portal/settings" element={<SettingsPage />} />
                <Route path="login" element={<Navigate to="/" replace />} />
                <Route path="signup" element={<Navigate to="/" replace />} />
                <Route path="forgot-password" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
