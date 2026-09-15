// BACKEND: replace this implementation with a real API/database call. Signature stays the same.

import {
  clone,
  initialUsers,
} from '../data/mockData';
import {
  Role,
  User,
} from '../types';

function delay(ms?: number): Promise<void> {
  const duration = ms ?? Math.floor(200 + Math.random() * 200);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

let usersStore: User[] = clone(initialUsers);

export async function getUsers(): Promise<User[]> {
  await delay();
  return clone(usersStore);
}

export async function updateUserRole(
  userId: string,
  newRole: Role
): Promise<User> {
  await delay();

  const user = usersStore.find((u) => u.id === userId);
  if (!user) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  user.role = newRole;
  return clone(user);
}

export async function addUser(
  userData: Omit<User, 'id' | 'avatarInitial'>
): Promise<User> {
  await delay();

  const names = userData.name.trim().split(' ');
  const avatarInitial = names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : userData.name.slice(0, 2).toUpperCase();

  const newUser: User = {
    ...userData,
    id: `user-${Date.now().toString(36)}`,
    avatarInitial,
  };

  usersStore.push(newUser);
  return clone(newUser);
}

export async function deleteUser(userId: string): Promise<boolean> {
  await delay();

  const initialCount = usersStore.length;
  usersStore = usersStore.filter((u) => u.id !== userId);
  return usersStore.length < initialCount;
}
