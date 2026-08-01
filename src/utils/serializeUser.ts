import { IUser } from "../models/user.model";


export const serializeUser = (user: IUser) => ({
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