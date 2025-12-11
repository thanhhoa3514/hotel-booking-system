import api from './api';
import { User, Role } from '@/types/auth';

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsersFilters {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  roleId?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleId: string;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UpdateUserStatusDto {
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  reason?: string;
}

export interface UpdateUserRoleDto {
  roleId: string;
}

export const usersApi = {
  /**
   * Get all users with filters (admin/manager only)
   */
  getUsers: async (filters?: UsersFilters): Promise<UsersResponse> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.roleId) params.append('roleId', filters.roleId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<UsersResponse>(
      `/users?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUser: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user (admin/manager only)
   */
  createUser: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Update user status (admin only)
   */
  updateUserStatus: async (
    id: string,
    data: UpdateUserStatusDto
  ): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/status`, data);
    return response.data;
  },

  /**
   * Update user role (admin only)
   */
  updateUserRole: async (
    id: string,
    data: UpdateUserRoleDto
  ): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/role`, data);
    return response.data;
  },

  /**
   * Delete user (soft delete, admin only)
   */
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
