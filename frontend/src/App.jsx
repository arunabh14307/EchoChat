import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { useAuth } from '@hooks/useAuth';
import ProtectedRoute from '@components/layout/ProtectedRoute';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import ChatPage from '@pages/ChatPage';
import ProfilePage from '@pages/ProfilePage';
import NotificationSettings from '@pages/NotificationSettings';
import NotFoundPage from '@pages/NotFoundPage';
import Spinner from '@components/ui/Spinner';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { initAuth } = useAuth();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-surface-950 flex-center flex-col gap-4 text-center">
        <Spinner size="lg" className="text-primary-500" />
        <p className="text-sm font-semibold tracking-wide text-surface-400 select-none animate-pulse-slow">
          Connecting to EchoChat...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#27272f',
            color: '#f0f0f2',
            border: '1px solid #3f3f47',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#27272f' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#27272f' },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
