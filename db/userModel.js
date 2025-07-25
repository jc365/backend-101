import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  create_date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;