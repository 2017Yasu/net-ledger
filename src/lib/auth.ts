import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey"; // TODO: Replace with a strong, securely stored secret
const JWT_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRATION || "15m"; // Use ACCESS_TOKEN_EXPIRATION for access tokens

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "supersecretrefreshtokenkey"; // New secret for refresh tokens
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRATION || "7d"; // New expiration for refresh tokens

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (userId: string): string => {
  const payload = { userId };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  const payload = { userId };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
};

export const hashRefreshToken = async (token: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

export const compareHashedRefreshTokens = async (
  token: string,
  hashedToken: string,
): Promise<boolean> => {
  return bcrypt.compare(token, hashedToken);
};
