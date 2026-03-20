import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (phone, otp) => {
    // Mock login logic using the service
    const res = { data: { token: 'mock_worker_1234', user: { phone_number: phone, platform: 'Zepto', score: 850 } } };
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPolicy(null);
  };

  return (
    <AppContext.Provider value={{ user, setUser, policy, setPolicy, login, logout, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => useContext(AppContext);
