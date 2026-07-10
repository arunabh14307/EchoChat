import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { validateUsername, validateEmail, validatePassword } from '@utils/validators';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterForm = () => {
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength calculation
  const [strength, setStrength] = useState({
    score: 0,
    hasLength: false,
    hasLetter: false,
    hasNumber: false,
  });

  useEffect(() => {
    const hasLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    let score = 0;
    if (password.length > 0) {
      if (hasLength) {
        score++;
      }
      if (hasLetter) {
        score++;
      }
      if (hasNumber) {
        score++;
      }
    }

    setStrength({
      score,
      hasLength,
      hasLetter,
      hasNumber,
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const userErr = validateUsername(username);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    const newErrors = {};
    if (userErr) {
      newErrors.username = userErr;
    }
    if (emailErr) {
      newErrors.email = emailErr;
    }
    if (passErr) {
      newErrors.password = passErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register({ username, email, password });
    } catch (err) {
      // Errors handled via toast inside useAuth hook
    }
  };

  const strengthLabels = ['Too short', 'Weak', 'Medium', 'Strong'];
  const strengthColors = [
    'bg-surface-700',
    'bg-danger-500',
    'bg-warning-500',
    'bg-success-500',
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      <Input
        label="Username"
        type="text"
        placeholder="e.g. echo_dev"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
        leftIcon={<UserIcon className="w-5 h-5" />}
        disabled={isLoading}
        autoFocus
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        leftIcon={<Mail className="w-5 h-5" />}
        disabled={isLoading}
      />

      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-surface-300">
          Password
        </label>
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

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <div className="flex flex-col gap-2 mt-1 animate-fade-in select-none">
            <div className="flex justify-between items-center text-2xs font-semibold text-surface-400">
              <span>Password Strength:</span>
              <span
                className={
                  strength.score === 3
                    ? 'text-success-500'
                    : strength.score === 2
                    ? 'text-warning-500'
                    : 'text-danger-500'
                }
              >
                {strengthLabels[strength.score]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  strength.score >= 1 ? strengthColors[strength.score] : 'bg-surface-700'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  strength.score >= 2 ? strengthColors[strength.score] : 'bg-surface-700'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  strength.score >= 3 ? strengthColors[strength.score] : 'bg-surface-700'
                }`}
              />
            </div>

            {/* Checklist */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-2xs text-surface-400">
              <div className="flex items-center gap-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    strength.hasLength ? 'bg-success-500' : 'bg-surface-700'
                  }`}
                />
                <span>Min 8 characters</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    strength.hasLetter ? 'bg-success-500' : 'bg-surface-700'
                  }`}
                />
                <span>At least one letter</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    strength.hasNumber ? 'bg-success-500' : 'bg-surface-700'
                  }`}
                />
                <span>At least one number</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        loadingText="Creating Account..."
        className="w-full mt-2"
        rightIcon={<UserPlus className="w-4 h-4" />}
      >
        Sign Up
      </Button>

      <p className="text-sm text-center text-surface-400 select-none">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
