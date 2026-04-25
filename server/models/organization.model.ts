import { Document, Schema, Types, model } from "mongoose";

export type WorkspaceType = "Remote" | "Hybrid" | "On-site";

export interface Department {
  name: string;
}

export interface Location {
  country: string;
  city: string;
  workspaceType: WorkspaceType;
  isDefault: boolean;
}

export interface OrganizationDoc extends Document {
  userId: Types.ObjectId;
  departments: Department[];
  locations: Location[];
}

const OrganizationSchema = new Schema<OrganizationDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    departments: [
      {
        name: { type: String, required: true },
      },
    ],
    locations: [
      {
        country: { type: String, required: true },
        city: { type: String, required: true },
        workspaceType: {
          type: String,
          enum: ["Remote", "Hybrid", "On-site"],
          required: true,
        },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    collection: "organization",
  },
);

const Organization = model<OrganizationDoc>("Organization", OrganizationSchema);

export default Organization;
