import { Logger } from "borgen";
import { ENV } from "../lib/environments";
import Account from "../models/account.model";
import { hashPassword } from "../lib/auth-utils";
import SiteSettings from "../models/settings.model";
import User, { UserRole } from "../models/user.model";

function seedDatabase() {
  Logger.info({ message: "Initializing database..." });
  try {
    seedSettings();
    seedAdmin();
    return true;
  } catch (err) {
    Logger.error({ message: "Database initialization failed : " + err });
    return false;
  }
}

export default seedDatabase;

// Seed admin
async function seedAdmin() {
  Logger.info({ message: "Initializing admin..." });

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
        role: UserRole.ADMIN,
      });

      // Create admin account credentials
      await Account.create({
        accountId: "seed-admin",
        providerId: "credentials",
        userId: existingAdmin._id,
        password: hashedPassword,
      });

      Logger.info({
        message: "Admin seeded successfully",
        messageColor: "greenBright",
        infoColor: "gray",
      });
      return;
    }

    // Ensure admin has correct role and account credentials
    if (existingAdmin.role !== UserRole.ADMIN) {
      existingAdmin.role = UserRole.ADMIN;
      await existingAdmin.save();
    }

    const existingAccount = await Account.findOne({
      userId: existingAdmin._id,
    });

    if (!existingAccount) {
      const hashedPassword = await hashPassword("admin123^");

      await Account.create({
        accountId: "seed-admin",
        providerId: "credentials",
        userId: existingAdmin._id,
        password: hashedPassword,
      });
    }

    Logger.info({
      message: "Admin already exist in Db",
      messageColor: "magentaBright",
    });
  } catch (err) {
    Logger.error({ message: "Error initializing Admin" + err });
  }
}

// Seeds the site settings
async function seedSettings() {
  Logger.info({ message: "Initializing settings..." });
  try {
    // Check if settings exist in Db
    let existingSettings = await SiteSettings.find().exec();

    if (existingSettings.length < 1) {
      // Create site settings
      let settings = new SiteSettings({});

      await settings.save();
      Logger.info({
        message: "Settings initialized successfully",
        messageColor: "greenBright",
        infoColor: "gray",
      });
    } else {
      Logger.info({
        message: "Settings already exist in Db",
        messageColor: "magentaBright",
      });
    }
  } catch (err) {
    Logger.error({ message: "Error initializing settings" });
  }
}
