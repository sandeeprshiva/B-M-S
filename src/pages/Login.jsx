import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getRoleBasedRedirect } from '../utils/roleRedirect';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const roleOptions = [
    { value: '', label: 'Select Role' },
    { value: 'admin', label: 'Admin - Full Access' },
    { value: 'sales', label: 'Sales - Sales & Inventory' },
    { value: 'accounts', label: 'Accounts - Financial Management' },
    { value: 'purchase', label: 'Purchase - Procurement & Orders' }
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password || !loginForm.role) {
      show('Please fill in all fields including role selection', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await login(loginForm.username, loginForm.password, loginForm.role);
      if (result.success) {
        const redirectPath = getRoleBasedRedirect(result.user?.role || loginForm.role);
        show(`Welcome ${result.user?.name || loginForm.username}! Redirecting to your dashboard...`, 'success');
        
        // Small delay to show the success message before redirect
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);
      } else {
        show(result.error || 'Login failed', 'error');
      }
    } catch (error) {
      show('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!signupForm.name || !signupForm.username || !signupForm.email || 
        !signupForm.password || !signupForm.confirmPassword || !signupForm.role) {
      show('Please fill in all fields', 'error');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      show('Passwords do not match', 'error');
      return;
    }

    if (signupForm.password.length < 6) {
      show('Password must be at least 6 characters', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(signupForm.email)) {
      show('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await register(signupForm);
      if (result.success) {
        show('Account created successfully! Please login with your credentials.', 'success');
        // Reset signup form
        setSignupForm({
          name: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: ''
        });
        // Switch back to login mode
        setIsSignUp(false);
      } else {
        show(result.error || 'Registration failed', 'error');
      }
    } catch (error) {
      show('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl gap-8 justify-center">
        {/* Login Section - Only show when not in signup mode */}
        {!isSignUp && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transition-all duration-300 w-full max-w-md opacity-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Login Page</h2>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Login Id</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Role</label>
              <select
                value={loginForm.role}
                onChange={(e) => setLoginForm({ ...loginForm, role: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none transition-colors"
                required
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-700">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-transparent border border-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(true)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Forgot Password? | Sign Up
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>- Check for Login Credentials</p>
            <p>- Match creds and allow for login a user</p>
            <p>- If Creds don't match show an error msg</p>
            <p>- If login is successful, redirect to dashboard</p>
            <p>- When clicked on SignUp, Land to SignUp page and only invoicing user will be created.</p>
            <p>- When clicked on Forgot Password click on Forgot Password page</p>
          </div>
        </div>
        )}

        {/* Signup Section - Only show when isSignUp is true */}
        {isSignUp && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transition-all duration-300 w-full max-w-md opacity-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign up page</h2>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={signupForm.role}
                  onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  required
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-700">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Login id</label>
                <input
                  type="text"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  placeholder="Username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors text-sm"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email id</label>
              <input
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors text-sm"
                placeholder="Email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Re-Enter password</label>
              <input
                type="password"
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors text-sm"
                placeholder="Confirm password"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-transparent border border-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Creating...' : 'Sign Up'}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="flex-1 py-2 px-4 bg-transparent border border-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none transition-all text-sm"
              >
                Back to Login
              </button>
            </div>
          </form>

          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p className="text-green-400 font-medium">For Sign up Page:</p>
            <p>Create a invoicing user database into the system on Signup</p>
            <p>Check creds as follows:</p>
            <p>1. Name should be in proper case and must be a between 6-25 characters.</p>
            <p>2. Login id should be unique and must be a between 6-25 characters.</p>
            <p>3. Email id should be unique and must contain a valid email, a large case and</p>
            <p>a special character and length should be no more than 8 characters.</p>
            <p className="text-green-400">User Right:</p>
            <p>invoicing user - he can not modify the master but can create</p>
            <p>admin - all access rights</p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Login;
