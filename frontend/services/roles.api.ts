import { api } from "./api";
import { Role } from "@/types/auth";

export const rolesApi = {
  /**
   * Get all roles (admin/manager only)
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>("/roles");
    return response.data;
  },
};
