import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    // Dynamic import
    const { default: User } = await import("./src/models/User.js");

    const existing = await User.findOne({ email: "simple2@admin.com" });
    if (existing) {
      console.log("Admin already exists:", existing.email);
      return;
    }

    const admin = new User({
      email: "simple2@admin.com",
      password: "Admin123",
      firstName: "Admin",
      lastName: "System",
      role: "admin",
      isActive: true,
      isVerified: true
    });

    await admin.save();
    console.log(" ADMIN CREATED!");
    console.log("Email: admin@test.com");
    console.log("Password: Admin123");

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
