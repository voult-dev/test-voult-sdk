import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import MfaPage from './pages/MfaPage';
import PasskeysPage from './pages/PasskeysPage';
import MagicLinkPage from './pages/MagicLinkPage';
import MagicCallbackPage from './pages/MagicCallbackPage';
import OAuthPage from './pages/OAuthPage';
import AccountPage from './pages/AccountPage';
import SessionsPage from './pages/SessionsPage';
import UtilitiesPage from './pages/UtilitiesPage';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="signin" element={<SigninPage />} />
            <Route path="mfa" element={<MfaPage />} />
            <Route path="passkeys" element={<PasskeysPage />} />
            <Route path="magic-link" element={<MagicLinkPage />} />
            <Route path="magic-callback" element={<MagicCallbackPage />} />
            <Route path="oauth" element={<OAuthPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="utilities" element={<UtilitiesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
