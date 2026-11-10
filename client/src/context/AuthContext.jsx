import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('spendwise_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem('spendwise_token');
      if (!savedToken) return null;
      const saved = localStorage.getItem('spendwise_user');
      if (saved) return JSON.parse(saved);
      const savedName = localStorage.getItem('spendwise_name');
      const savedEmail = localStorage.getItem('spendwise_email');
      const savedSchool = localStorage.getItem('spendwise_school');
      if (savedName || savedEmail) {
        return {
          id: 'usr-cached',
          name: savedName || 'Student',
          fullname: savedName || 'Student',
          email: savedEmail || '',
          school: savedSchool || 'Lagos State University',
          role: 'Student',
          currency: 'NGN',
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync token to localStorage
  const updateToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('spendwise_token', newToken);
    } else {
      localStorage.removeItem('spendwise_token');
    }
  }, []);

  // Sync user to localStorage
  const updateUser = useCallback((newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('spendwise_user', JSON.stringify(newUser));
      if (newUser.name || newUser.fullname) {
        localStorage.setItem('spendwise_name', newUser.name || newUser.fullname);
      }
      if (newUser.email) {
        localStorage.setItem('spendwise_email', newUser.email);
      }
      if (newUser.school) {
        localStorage.setItem('spendwise_school', newUser.school);
      }
    } else {
      localStorage.removeItem('spendwise_user');
      localStorage.removeItem('spendwise_name');
      localStorage.removeItem('spendwise_email');
      localStorage.removeItem('spendwise_school');
    }
  }, []);

  // Log out and clear credentials
  const logout = useCallback(() => {
    updateToken(null);
    updateUser(null);
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
    localStorage.removeItem('spendwise_name');
    localStorage.removeItem('spendwise_school');
    localStorage.removeItem('spendwise_email');
  }, [updateToken, updateUser]);

  // Fetch verified profile on mount if token exists
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!token) return;

      try {
        const response = await getCurrentUser();
        if (isMounted && response?.data?.user) {
          const apiUser = response.data.user;
          const mapped = {
            id: apiUser.id,
            name: apiUser.fullname || apiUser.name || 'Student',
            fullname: apiUser.fullname || apiUser.name || 'Student',
            email: apiUser.email,
            school: apiUser.school || 'Lagos State University',
            role: 'Student',
            currency: apiUser.currency || 'NGN',
          };
          updateUser(mapped);
          setIsOnline(true);
        }
      } catch (err) {
        if (err.isOffline) {
          setIsOnline(false);
        } else if (err.status === 401 || err.status === 403) {
          console.warn('Authentication token expired or unauthorized. Logging out.');
          logout();
        }
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [token, updateUser, logout]);

  /**
   * Log in user with backend API
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await loginUser({ email, password });
      if (res?.data?.token && res?.data?.user) {
        const apiUser = res.data.user;
        const mapped = {
          id: apiUser.id,
          name: apiUser.fullname || apiUser.name || 'Student',
          fullname: apiUser.fullname || apiUser.name || 'Student',
          email: apiUser.email,
          school: apiUser.school || 'Lagos State University',
          role: 'Student',
          currency: apiUser.currency || 'NGN',
        };
        updateToken(res.data.token);
        updateUser(mapped);
        setIsOnline(true);
        setIsLoading(false);
        return { success: true, user: mapped };
      }
      throw new Error(res?.message || 'Login failed.');
    } catch (err) {
      setIsLoading(false);
      const message =
        err?.data?.message ||
        err?.message ||
        'Invalid email or password.';
      setAuthError(message);
      return {
        success: false,
        message,
      };
    }
  };

  /**
   * Register user with backend API
   */
  const register = async (fullname, email, password, school, currency = 'NGN') => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await registerUser({ fullname, email, password, school, currency });
      if (res?.data?.token && res?.data?.user) {
        const apiUser = res.data.user;
        const mapped = {
          id: apiUser.id,
          name: apiUser.fullname,
          fullname: apiUser.fullname,
          email: apiUser.email,
          school: apiUser.school || school || 'Lagos State University',
          role: 'Student',
          currency: apiUser.currency || currency,
        };
        updateToken(res.data.token);
        updateUser(mapped);
        setIsOnline(true);
        setIsLoading(false);
        return { success: true, user: mapped };
      }
      throw new Error(res?.message || 'Registration failed.');
    } catch (err) {
      setIsLoading(false);
      const message =
        err?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setAuthError(message);
      return {
        success: false,
        message,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        isOnline,
        authError,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
