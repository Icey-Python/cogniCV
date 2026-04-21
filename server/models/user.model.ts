import { Document, Schema, model } from "mongoose";

export interface UserDoc extends Document {
  name: string;
  image: string;
  email: string;
  phone: string;
  role: string;
  lastLogin: Date;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

const UserSchema: Schema = new Schema<UserDoc>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = model<UserDoc>("User", UserSchema);

export default User;
