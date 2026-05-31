import React, { createContext, useContext, useEffect, useState } from 'react';
import { staff as seedStaff } from '../data/staff';
import { apiPost, setToken, ApiUnavailable } from '../api/client';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = 'comforto_auth';
const USERS_FALLBACK_KEY = 'comforto_users_v2';

// Dev / offline fallback: when the API can't be reached (e.g. `vite dev`),
// verify credentials against the seed list plus any locally-saved user edits.
const localCredentialCheck = (email, password) => {
  const e = (email || '').trim().toLowerCase();
  let list = seedStaff;
  try {
    const raw = localStorage.getItem(USERS_FALLBACK_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) list = parsed;
  } catch { /* use seed */ }
  return list.find(u => (u.email || '').toLowerCase() === e && u.password === password) || null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = async (email, password) => {
    try {
      const { token, user: safe } = await apiPost('/api/auth/login', { email, password });
      setToken(token);
      setUser(safe);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiUnavailable) {
        // Offline / local dev — fall back to client-side credential check.
        const found = localCredentialCheck(email, password);
        if (!found) return { ok: false, error: 'Invalid email or password' };
        const { password: _pw, ...safe } = found;
        setToken('');
        setUser(safe);
        return { ok: true };
      }
      return { ok: false, error: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    apiPost('/api/auth/logout').catch(() => {});
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthed: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
