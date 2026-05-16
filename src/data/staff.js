// Internal staff seed list.
//
// Two roles:
//   - 'admin'    → "Staff"    (full access, including user management)
//   - 'designer' → "Interior" (products / categories / collection, no user mgmt)
//
// Admin edits made via the Users tab in the Admin page are overlaid on top of
// this seed in localStorage. To make those edits permanent for the deployed
// site, export an updated staff.js from the Admin page and replace this file,
// then redeploy.
//
// NOTE: This is a soft client-side gate, not real security. Anyone who
// downloads the JS bundle can read these credentials. Acceptable for an
// internal staff-only catalog tool with no payment data; replace with a real
// backend before storing anything sensitive.

export const ROLES = {
  admin:    { id: 'admin',    label: 'Staff' },
  designer: { id: 'designer', label: 'Interior' }
};

export const roleLabel = (roleId) => ROLES[roleId]?.label || roleId;

export const staff = [
  { id: 'admin',    name: 'Staff',           email: 'staff@comforto.in',    password: 'comforto@2024', role: 'admin' },
  { id: 'designer', name: 'Interior',        email: 'designer@comforto.in', password: 'design@123',    role: 'designer' }
];
