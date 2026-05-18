import axiosInstance from './axiosInstance';
import { ApiResponse, IUser, Role } from '../types';

export interface AuthResponse {
  token: string;
  user: IUser;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams extends LoginParams {
  name: string;
  role?: Role;
}

/**
 * Register a new user
 * @param data Registration payload
 * @returns ApiResponse with token and user
 */
export const register = async (data: RegisterParams): Promise<ApiResponse<AuthResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data;
};

/**
 * Log in an existing user
 * @param data Login payload
 * @returns ApiResponse with token and user
 */
export const login = async (data: LoginParams): Promise<ApiResponse<AuthResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data;
};

/**
 * Get the currently authenticated user
 * @returns ApiResponse with user
 */
export const getMe = async (): Promise<ApiResponse<IUser>> => {
  const response = await axiosInstance.get<ApiResponse<IUser>>('/auth/me');
  return response.data;
};
