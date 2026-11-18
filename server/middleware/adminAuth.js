
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

export async function adminAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const token = authorization.slice(7);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    if (!mongoose.isValidObjectId(decoded.adminId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token."
      });
    }

    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Administrator account not found."
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token."
      });
    }

    console.error("Admin authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication failed."
    });
  }
}
