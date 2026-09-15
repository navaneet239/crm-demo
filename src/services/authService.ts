// BACKEND: replace this implementation with a real API/database call. Signature stays the same.

import {
  clone,
  initialUsers,
} from '../data/mockData';
import {
  Role,
  User,
} from '../types';
import { getUsers } from './userService';

function delay(ms?: number): Promise<void> {
  const duration = ms ?? Math.floor(200 + Math.random() * 200);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

const STORAGE_KEY = 'brokerage_crm_current_user';

let cachedUser: User | null = null;

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

function persistUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export async function getCurrentUser(): Promise<User> {
  await delay(150);

  if (!cachedUser) {
    cachedUser = loadStoredUser();
  }

  if (!cachedUser) {
    // Default session: Sarah Al-Maktoum (Admin)
    cachedUser = clone(initialUsers[0]);
    persistUser(cachedUser);
  }

  return clone(cachedUser);
}

export async function setCurrentUser(user: User): Promise<User> {
  await delay(150);
  cachedUser = clone(user);
  persistUser(cachedUser);
  return clone(cachedUser);
}

export async function switchRole(role: Role): Promise<User> {
  await delay(200);

  const allUsers = await getUsers();
  // Find standard account for this role to make demo vivid
  let matchedUser = allUsers.find((u) => u.role === role);

  if (!matchedUser) {
    // If no existing user has this role, adjust the current user's role
    const current = await getCurrentUser();
    matchedUser = {
      ...current,
      role,
    };
  }

  cachedUser = clone(matchedUser);
  persistUser(cachedUser);
  return clone(cachedUser);
}

export async function login(email: string, _password: string): Promise<User> {
  await delay(300);

  const allUsers = await getUsers();
  const trimmedEmail = email.trim().toLowerCase();
  const found = allUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

  if (found) {
    cachedUser = clone(found);
    persistUser(cachedUser);
    return clone(cachedUser);
  }

  // Accept any other credentials for the demo
  const fallbackUser: User = {
    id: `user-${Date.now().toString(36)}`,
    name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Demo Broker',
    email: email.trim() || 'demo@brokerage.ae',
    role: 'Admin',
    avatarInitial: (email[0] || 'D').toUpperCase() + (email[1] || 'B').toUpperCase(),
    title: 'Advisory Director',
  };

  cachedUser = clone(fallbackUser);
  persistUser(cachedUser);
  return clone(cachedUser);
}

export async function logout(): Promise<void> {
  await delay(150);
  cachedUser = null;
  persistUser(null);
}
