import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToLanding: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToLanding }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await api.signIn(email, password);
        const user = await api.getCurrentUser();
        if (user) {
          onLogin(user);
        } else {
          setError('Login succeeded but failed to fetch profile.');
        }
      } else {
        // Sign Up
        // For now, we default to CLIENT role for self-signup
        const name = email.split('@')[0];
        await api.signUp(email, password, name, UserRole.CLIENT);
        // Auto-login after signup if Supabase allows, or ask to confirm email
        // api.signUp returns session if auto-confirm is on.
        // Let's try to get user.
        const user = await api.getCurrentUser();
        if (user) {
          onLogin(user);
        } else {
          setError('Account created! Please check your email to confirm before logging in.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center justify-center cursor-pointer mb-8" onClick={onNavigateToLanding}>
          <div className="text-zinc-900 font-extrabold text-4xl leading-none tracking-tight uppercase">
            LIFE TIME
          </div>
          <div className="text-zinc-900 font-serif italic text-3xl leading-none -mt-1 ml-0.5">
            Swim
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 uppercase">
          {isLogin ? 'Member Sign In' : 'Create Account'}
        </h2>
        <p className="mt-4 text-center text-sm text-zinc-600">
          Or{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-zinc-900 hover:text-black underline">
            {isLogin ? 'join the club today' : 'sign in to existing account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-10 px-6 shadow-xl sm:rounded-lg sm:px-10 border-t-4 border-t-zinc-900">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 uppercase tracking-wide">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 placeholder-zinc-400 text-zinc-900 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 uppercase tracking-wide">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 placeholder-zinc-400 text-zinc-900 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button type="submit" className="w-full flex justify-center py-3" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </div>
          </form>


        </Card>
      </div>
    </div>
  );
};