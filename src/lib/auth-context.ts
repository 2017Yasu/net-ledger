import { createContext, useContext } from "react";

interface AuthContextType {
  user: { id: string; username: string } | null;
  accessToken: string | null;
  login: (accessToken: string, user: { id: string; username: string }) => void;
  logout: () => void;
  updateAccessToken: (newAccessToken: string) => void; // New function
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
