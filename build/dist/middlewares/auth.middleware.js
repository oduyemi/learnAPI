"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = payload.sub;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authenticateUser = authenticateUser;
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
