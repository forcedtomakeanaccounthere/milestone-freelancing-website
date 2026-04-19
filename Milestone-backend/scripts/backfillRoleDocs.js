const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/user");
const Employer = require("../models/employer");
const Freelancer = require("../models/freelancer");
const Moderator = require("../models/moderator");
const Admin = require("../models/admin");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing in .env");
  }

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 20000,
  });

  const users = await User.find(
    {
      role: { $in: ["Employer", "Freelancer", "Moderator", "Admin"] },
      roleId: { $exists: true, $ne: "" },
      userId: { $exists: true, $ne: "" },
    },
    { userId: 1, role: 1, roleId: 1 }
  ).lean();

  const created = {
    Employer: 0,
    Freelancer: 0,
    Moderator: 0,
    Admin: 0,
  };

  for (const user of users) {
    if (user.role === "Employer") {
      const res = await Employer.updateOne(
        { userId: user.userId },
        { $setOnInsert: { userId: user.userId, employerId: user.roleId } },
        { upsert: true }
      );
      if (res.upsertedCount) created.Employer += 1;
    }

    if (user.role === "Freelancer") {
      const res = await Freelancer.updateOne(
        { userId: user.userId },
        { $setOnInsert: { userId: user.userId, freelancerId: user.roleId } },
        { upsert: true }
      );
      if (res.upsertedCount) created.Freelancer += 1;
    }

    if (user.role === "Moderator") {
      const res = await Moderator.updateOne(
        { userId: user.userId },
        { $setOnInsert: { userId: user.userId, moderatorId: user.roleId } },
        { upsert: true }
      );
      if (res.upsertedCount) created.Moderator += 1;
    }

    if (user.role === "Admin") {
      const res = await Admin.updateOne(
        { userId: user.userId },
        { $setOnInsert: { userId: user.userId, adminId: user.roleId } },
        { upsert: true }
      );
      if (res.upsertedCount) created.Admin += 1;
    }
  }

  const counts = {
    users: await User.countDocuments(),
    employers: await Employer.countDocuments(),
    freelancers: await Freelancer.countDocuments(),
    moderators: await Moderator.countDocuments(),
    admins: await Admin.countDocuments(),
  };

  console.log("[OK] Connected DB:", mongoose.connection.name);
  console.log("[OK] Backfill created:", created);
  console.log("[OK] Collection counts:", counts);
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("[ERROR]", err.message);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect errors
    }
    process.exit(1);
  });
