import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User, { IUser } from "../models/userModel";

dotenv.config();

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      type: string;
    };

    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



// export const checkAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
//   if (!req.admin) {
//     res.status(401).json({ message: "Unauthorized. User not authenticated." });
//     return;
//   }

//   const allowedRoles = new Set(["admin", "superAdmin"]);
//   if (!allowedRoles.has(req.user.role)) {
//     res.status(403).json({ message: "Forbidden. User is not an admin." });
//     return;
//   }

  // next();
// };

// export const checkSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
//   if (!req.user || req.user.role !== "superAdmin") {
//       res.status(403).json({ message: "Forbidden: Only super administrators can perform this action." });
//       return;
//   }
//   next();
// };