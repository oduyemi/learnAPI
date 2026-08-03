"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeUser = void 0;
const serializeUser = (user) => ({
    _id: user._id,
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    phone: user.phone,
    role: user.role,
    img: user.img,
    cohort: user.cohort,
    status: user.status,
    resetPasswordToken: user.resetPasswordToken,
    resetPasswordExpires: user.resetPasswordExpires,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
exports.serializeUser = serializeUser;
