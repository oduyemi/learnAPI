import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { dbConnect } from "../db/index";
import User from "../models/user.model";
import { generateTemporaryPassword } from "../utils/password";
import { sendAdminOnboardingMail } from "../utils/sendEmail";

export const seedAdmin = async () => {
  try {
    await dbConnect();
    const email = "yemi@progrowing.org";
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const admin = await User.create({
      fname: "Yemi",
      lname: "Oduyemi",
      email,
      phone: "+2348166336187",
      role: "admin",
      cohort: null,
      password: hashedPassword,
      status: "active",
    });

    await sendAdminOnboardingMail(email, temporaryPassword);
    console.log("Admin seeded successfully.");
    console.log(`Email: ${admin.email}`);
    console.log("Temporary password:", temporaryPassword);
    console.log("Onboarding email sent.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();