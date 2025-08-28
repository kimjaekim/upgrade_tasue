import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    const savedUser = localStorage.getItem('tashu_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('tashu_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: Date.now(),
        phone: credentials.phone,
        name: credentials.name || '타슈 사용자',
        email: credentials.email || '',
        joinDate: new Date().toISOString(),
        totalDistance: 0,
        totalCO2Saved: 0,
        totalPoints: 0,
        level: 1
      };
      
      setUser(userData);
      localStorage.setItem('tashu_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser = {
        id: Date.now(),
        ...userData,
        joinDate: new Date().toISOString(),
        totalDistance: 0,
        totalCO2Saved: 0,
        totalPoints: 0,
        level: 1
      };
      
      setUser(newUser);
      localStorage.setItem('tashu_user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tashu_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('tashu_user', JSON.stringify(updatedUser));
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  };
};

export default useAuth;
