import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model";
import { verifyToken, UserRole } from "../utils/auth";
import dbConnect from "../db";

export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * UNIVERSAL AUTHENTICATION
 *
 * Authenticates every type of user:
 * - admin
 * - instructor
 * - mentor
 * - student
 *
 * The user's role is available through:
 *
 * req.user.role
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await dbConnect();

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded?.id) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
      return;
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
      return;
    }

    if (user.status === "suspended") {
      res.status(403).json({
        success: false,
        message: "Your account has been suspended.",
      });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication Error:", error);

    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

/**
 * ROLE AUTHORIZATION
 *
 * Example:
 *
 * requireRole("admin")
 *
 * or:
 *
 * requireRole("admin", "instructor")
 *
 * Authentication must happen before this middleware.
 */
export const requireRole =
  (...roles: UserRole[]) =>
  (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
      return;
    }

    next();
  };