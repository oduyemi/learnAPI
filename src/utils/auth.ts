import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";

export type UserRole =
  | "student"
  | "mentor"
  | "instructor"
  | "admin";

export interface JwtPayload {
  id: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};