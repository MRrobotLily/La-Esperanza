import { User } from '../types';

const API_URL = 'http://localhost:3001/api';

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
};