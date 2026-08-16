require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const EMAIL = "pankaj@example.com";
const NEW_PASSWORD = "PankajTest@123";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL;

    if (!mongoUri) {
      throw new Error(
        "MongoDB connection string not found. Check MONGO_URI/MONGODB_URI in .env"
      );
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const resetPassword = async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email: EMAIL }).select("+password");

    if (!user) {
      console.log(`User not found: ${EMAIL}`);
      return;
    }

    console.log("User found:", user.email);

    // Hash manually because we are using findOne + direct assignment.
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    user.password = hashedPassword;

    // Since password is already hashed, save() would trigger
    // the pre-save hook and hash it AGAIN.
    // Therefore use updateOne instead.
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    console.log("=================================");
    console.log("PASSWORD RESET SUCCESSFUL");
    console.log("Email:", EMAIL);
    console.log("New password:", NEW_PASSWORD);
    console.log("=================================");
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

resetPassword();