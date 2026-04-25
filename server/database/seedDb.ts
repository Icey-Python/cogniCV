import { Logger } from "borgen";
import { ENV } from "../lib/environments";
import Account from "../models/account.model";
import { hashPassword } from "../lib/auth-utils";
import User, { UserRole } from "../models/user.model";

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

      Logger.info({
        message: "Recruiter seeded successfully",
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

    Logger.info({
      message: "Recruiter already exist in Db",
      messageColor: "magentaBright",
    });
  } catch (err) {
    Logger.error({ message: "Error initializing Admin" + err });
  }
}
