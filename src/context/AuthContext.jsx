import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUsers } from './UsersContext';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = 'comforto_auth';

export const AuthProvider = ({ children }) => {
  const { findByCredentials, users } = useUsers();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // If the active user gets deleted or has their role/email changed in the
  // Users tab, reconcile our stored session so stale data doesn't linger.
  useEffect(() => {
    if (!user) return;
    const current = users.find(u => u.id === user.id);
    if (!current) {
      setUser(null);
      return;
    }
    if (current.role !== user.role || current.name !== user.name || current.email !== user.email) {
      const { password: _pw, ...safe } = current;
      setUser(safe);
    }
  }, [users]);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = (email, password) => {
    const found = findByCredentials(email, password);
    if (!found) return { ok: false, error: 'Invalid email or password' };
    const { password: _pw, ...safe } = found;
    setUser(safe);
    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthed: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
