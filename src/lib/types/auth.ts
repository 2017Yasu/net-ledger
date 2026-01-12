export interface User {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
    accessToken: string;
}

export type LoginResponse = AuthResponse & {
  user: User;
};
