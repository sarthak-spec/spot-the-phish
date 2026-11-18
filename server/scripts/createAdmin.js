
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

async function createAdmin() {
  try {
    const { MONGO_URI, ADMIN_USERNAME, ADMIN_PASSWORD } =
      process.env;

    if (!MONGO_URI || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
      throw new Error("Missing admin configuration in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const existingAdmin = await Admin.findOne({
      username: ADMIN_USERNAME
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const admin = new Admin({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });

    await admin.save();

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
