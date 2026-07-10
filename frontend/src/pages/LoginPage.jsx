import React from 'react';
import LoginForm from '@components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradient blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-[440px] glass-heavy p-8 md:p-10 rounded-2xl shadow-glow flex flex-col items-center gap-8 relative z-10 animate-fade-up">
        {/* Branding header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-glow-sm">
            <svg
              className="w-7 h-7 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M8 10C8 8.9 8.9 8 10 8h12c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-5l-4 4v-4h-3c-1.1 0-2-.9-2-2V10z"
                fill="currentColor"
              />
              <circle cx="12" cy="14" r="1.5" fill="#4f46e5" />
              <circle cx="16" cy="14" r="1.5" fill="#4f46e5" />
              <circle cx="20" cy="14" r="1.5" fill="#4f46e5" />
            </svg>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <h1 className="text-2xl font-bold text-surface-50 tracking-tight">
              Sign in to <span className="gradient-text">EchoChat</span>
            </h1>
            <p className="text-sm text-surface-400">
              Welcome back! Please enter your details below.
            </p>
          </div>
        </div>

        {/* Login form */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
