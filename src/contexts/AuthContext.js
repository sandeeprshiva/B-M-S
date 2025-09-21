import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { usersAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, selectedRole) => {
    try {
      const response = await api.get('/users', {
        params: { username: `eq.${username}` }
      });
      const users = response.data || [];
      const candidate = Array.isArray(users) && users.length > 0 ? users[0] : null;
      const foundUser = candidate && (candidate.password === password);
      
      if (foundUser) {
        // Check if the selected role matches the user's role
        if (candidate.role !== selectedRole) {
          return { success: false, error: 'Selected role does not match your account role' };
        }

        const userData = {
          id: candidate.id,
          username: candidate.username,
          role: candidate.role,
          name: candidate.name || candidate.username,
          email: candidate.email,
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', 'demo-token');
        
        return { success: true, user: userData };
      } 

      // Development fallback
      if (username === 'admin' && password === 'admin' && selectedRole === 'admin') {
        const userData = { id: 'dev-admin', username: 'admin', role: 'admin', name: 'Administrator' };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', 'demo-token');
        return { success: true, user: userData, fallback: true };
      }

      return { success: false, error: 'Invalid credentials or role mismatch' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Starting user registration process...', { userData: { ...userData, password: '[HIDDEN]' } });
      
      // Enhanced validation
      const { name, username, email, password, role } = userData;

      // Name validation (6-25 characters, proper case)
      if (name.length < 6 || name.length > 25) {
        return { success: false, error: 'Name must be between 6-25 characters' };
      }

      // Username validation (6-25 characters, unique)
      if (username.length < 6 || username.length > 25) {
        return { success: false, error: 'Username must be between 6-25 characters' };
      }

      // Email validation (valid format)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Password validation (minimum 6 characters)
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }


      // Check if username already exists
      console.log('Checking username uniqueness...', username);
      const existingUserResponse = await usersAPI.getByUsername(username);
      if (existingUserResponse.data && existingUserResponse.data.length > 0) {
        console.log('Username already exists:', username);
        return { success: false, error: 'Username already exists' };
      }

      // Check if email already exists
      console.log('Checking email uniqueness...', email);
      const existingEmailResponse = await usersAPI.getByEmail(email);
      if (existingEmailResponse.data && existingEmailResponse.data.length > 0) {
        console.log('Email already exists:', email);
        return { success: false, error: 'Email already exists' };
      }

      // Create new user
      const newUser = {
        name: name.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: password, // In production, this should be hashed
        role: role,
        created_at: new Date().toISOString(),
        status: 'active'
      };

      console.log('Creating new user...', { ...newUser, password: '[HIDDEN]' });
      const response = await usersAPI.create(newUser);
      console.log('User creation response:', response.data);

      if (response.data) {
        console.log('User created successfully:', response.data);
        return { success: true, user: response.data };
      }

      console.log('Failed to create user - no response data');
      return { success: false, error: 'Failed to create user account' };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.hint || 
                          'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const hasPermission = (requiredRoles) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has access to everything
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    
    return user.role === requiredRoles;
  };

  const value = {
    user,
    login,
    register,
    logout,
    hasPermission,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
