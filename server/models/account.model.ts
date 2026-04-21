import { Document, Schema, Types, model } from "mongoose";

// DO NOT MODIFY THIS FILE
export interface AccountDoc extends Document {
  accountId: string;
  providerId: string;
  userId: Types.ObjectId;
  password: string;
}

const AccountSchema: Schema = new Schema<AccountDoc>(
  {
    accountId: {
      type: String,
    },
    providerId: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "account",
  }
);

const Account = model<AccountDoc>("account", AccountSchema);

export default Account;
