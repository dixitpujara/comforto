import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { staff as seedStaff, ROLES } from '../data/staff';

const UsersContext = createContext();
export const useUsers = () => useContext(UsersContext);

// Bump this when the seed in src/data/staff.js changes in a way that
// must override browser-cached user lists (e.g. renaming a built-in
// account's email or password). Each bump causes one-time loss of
// localStorage edits made via the Admin > Users tab.
const STORAGE_KEY = 'comforto_users_v2';

const clone = (v) => JSON.parse(JSON.stringify(v));

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const newId = () => `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState(() => loadDraft() || clone(seedStaff));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const hasUnexportedChanges = useMemo(
    () => JSON.stringify(users) !== JSON.stringify(seedStaff),
    [users]
  );

  const emailExists = (email, exceptId) =>
    users.some(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.id !== exceptId);

  const addUser = ({ name, email, password, role }) => {
    const e = (email || '').trim().toLowerCase();
    if (!e) return { ok: false, error: 'Email is required.' };
    if (!password) return { ok: false, error: 'Password is required.' };
    if (!ROLES[role]) return { ok: false, error: 'Pick a valid role.' };
    if (emailExists(e)) return { ok: false, error: 'A user with this email already exists.' };
    const id = newId();
    setUsers(list => [...list, { id, name: (name || '').trim() || e, email: e, password, role }]);
    return { ok: true, id };
  };

  const updateUser = (id, patch) => {
    if (patch.email !== undefined) {
      const e = patch.email.trim().toLowerCase();
      if (!e) return { ok: false, error: 'Email is required.' };
      if (emailExists(e, id)) return { ok: false, error: 'Another user already has this email.' };
      patch = { ...patch, email: e };
    }
    if (patch.role !== undefined && !ROLES[patch.role]) {
      return { ok: false, error: 'Pick a valid role.' };
    }
    setUsers(list => list.map(u => u.id === id ? { ...u, ...patch } : u));
    return { ok: true };
  };

  const deleteUser = (id) => {
    // Refuse to delete the last admin so the owner can't lock themselves out.
    const target = users.find(u => u.id === id);
    if (!target) return { ok: false, error: 'User not found.' };
    if (target.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) return { ok: false, error: 'You cannot delete the last Staff (admin) user.' };
    }
    setUsers(list => list.filter(u => u.id !== id));
    return { ok: true };
  };

  const resetToSeed = () => setUsers(clone(seedStaff));

  // Used by AuthContext.login
  const findByCredentials = (email, password) => {
    const e = (email || '').trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === e && u.password === password) || null;
  };

  const exportStaffJs = () => {
    const body = JSON.stringify(users, null, 2);
    return `// Internal staff seed list.
// Generated from Admin > Users on ${new Date().toISOString()}.
// Replace src/data/staff.js with this file, then redeploy to publish.
//
// NOTE: client-side gate only — anyone who downloads the JS bundle can read
// these credentials. Acceptable for an internal tool with no payment data.

export const ROLES = {
  admin:    { id: 'admin',    label: 'Staff' },
  designer: { id: 'designer', label: 'Interior' }
};

export const roleLabel = (roleId) => ROLES[roleId]?.label || roleId;

export const staff = ${body};
`;
  };

  return (
    <UsersContext.Provider value={{
      users,
      hasUnexportedChanges,
      addUser, updateUser, deleteUser,
      resetToSeed, exportStaffJs,
      findByCredentials,
      roles: ROLES
    }}>
      {children}
    </UsersContext.Provider>
  );
};
