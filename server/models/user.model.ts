import { Document, Schema, model } from "mongoose";

export interface UserDoc extends Document {
  name: string;
  image: string;
  email: string;
  phone: string;
  role: UserRole;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = "admin",
  RECRUITER = "recruiter",
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
      default: UserRole.RECRUITER,
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
  { timestamps: true },
);

const User = model<UserDoc>("User", UserSchema);

export default User;
