import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authApi } from '@/services/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApi.login(data);

          // Store token in localStorage
          localStorage.setItem('auth_token', response.access_token);

          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Đăng nhập thất bại';

          set({
            error: errorMessage,
            isLoading: false,
          });

          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApi.register(data);

          // Store token in localStorage
          localStorage.setItem('auth_token', response.access_token);

          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Đăng ký thất bại';

          set({
            error: errorMessage,
            isLoading: false,
          });

          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      loadUser: async () => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          set({ isLoading: true });

          const user = await authApi.getProfile();

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token invalid, clear auth
          localStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        localStorage.setItem('auth_token', token);
        set({ token, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
