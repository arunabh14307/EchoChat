import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { validateEmail } from '@utils/validators';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const emailErr = validateEmail(email);
    const newErrors = {};
    if (emailErr) {
      newErrors.email = emailErr;
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      // Errors handled via toast inside useAuth hook
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.info('Password recovery is not implemented yet. Please contact support.', {
      icon: '🔒',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        leftIcon={<Mail className="w-5 h-5" />}
        disabled={isLoading}
        autoFocus
      />

      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex justify-between items-center select-none">
          <label className="text-sm font-medium text-surface-300">
            Password
          </label>
          <a
            href="#"
            onClick={handleForgotPassword}
            className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              tabIndex="-1"
              onClick={() => setShowPassword(!showPassword)}
              className="text-surface-500 hover:text-surface-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        loadingText="Signing In..."
        className="w-full mt-2"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Sign In
      </Button>

      <p className="text-sm text-center text-surface-400 select-none">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
        >
          Create account
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
