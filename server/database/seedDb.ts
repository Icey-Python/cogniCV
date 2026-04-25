import { Logger } from "borgen";
import { ENV } from "../lib/environments";
import Account from "../models/account.model";
import { hashPassword } from "../lib/auth-utils";
import User, { UserRole } from "../models/user.model";
import Organization from "../models/organization.model";

function seedDatabase() {
  Logger.info({ message: "Initializing database..." });
  try {
    seedRecruiter();
    return true;
  } catch (err) {
    Logger.error({ message: "Database initialization failed : " + err });
    return false;
  }
}

export default seedDatabase;

// Seed admin
async function seedRecruiter() {
  Logger.info({ message: "Initializing recruiter..." });

  try {
    // Check if admin user exists in Db
    let existingAdmin = await User.findOne({
      email: ENV.ADMIN_INITIAL_EMAIL,
    }).exec();

    if (!existingAdmin) {
      const hashedPassword = await hashPassword(ENV.ADMIN_INITIAL_PASS);

      // Create admin user
      existingAdmin = await User.create({
        name: "John Doe",
        email: ENV.ADMIN_INITIAL_EMAIL,
        role: UserRole.RECRUITER,
      });

      // Create admin account credentials
      await Account.create({
        accountId: "seed-admin",
        providerId: "credentials",
        userId: existingAdmin._id,
        password: hashedPassword,
      });

      // Create initial organization settings
      await seedOrganization(existingAdmin._id.toString());

      Logger.info({
        message: "Recruiter and Organization seeded successfully",
        messageColor: "greenBright",
        infoColor: "gray",
      });
      return;
    }

    // Ensure admin has correct role and account credentials
    if (existingAdmin.role !== UserRole.RECRUITER) {
      existingAdmin.role = UserRole.RECRUITER;
      await existingAdmin.save();
    }

    const existingAccount = await Account.findOne({
      userId: existingAdmin._id,
    });

    if (!existingAccount) {
      const hashedPassword = await hashPassword(ENV.ADMIN_INITIAL_PASS);

      await Account.create({
        accountId: "seed-recruiter",
        providerId: "credentials",
        userId: existingAdmin._id,
        password: hashedPassword,
      });
    }

    // Ensure organization exists for the recruiter
    await seedOrganization(existingAdmin._id.toString());

    Logger.info({
      message: "Recruiter already exist in Db",
      messageColor: "magentaBright",
    });
  } catch (err) {
    Logger.error({ message: "Error initializing Admin" + err });
  }
}

async function seedOrganization(userId: string) {
  try {
    const organization = await Organization.findOne({ userId });

    if (!organization) {
      await Organization.create({
        userId,
        departments: [
          { name: "Engineering" },
          { name: "Human Resource (HR)" },
          { name: "Information Technology (IT)" },
          { name: "Marketing & Communications" },
          { name: "Sales & Business Development" },
          { name: "Finance & Accounting" },
          { name: "Operations" },
          { name: "Customer Support" },
          { name: "Product Management" },
          { name: "Legal" },
          { name: "Research & Development" },
        ],
        locations: [
          {
            country: "Global",
            city: "Everywhere",
            workspaceType: "Remote",
            isDefault: true,
          },
          {
            country: "Rwanda",
            city: "Kigali",
            workspaceType: "Hybrid",
            isDefault: false,
          },
          {
            country: "Kenya",
            city: "Nairobi",
            workspaceType: "Remote",
            isDefault: false,
          },
        ],
      });
      Logger.info({
        message: "Organization seeded successfully",
        messageColor: "greenBright",
      });
    }
  } catch (err) {
    Logger.error({ message: "Error seeding organization: " + err });
  }
}
