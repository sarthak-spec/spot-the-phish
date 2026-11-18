
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving a new admin
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare login password with stored password
adminSchema.methods.comparePassword = async function (
  enteredPassword
) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
