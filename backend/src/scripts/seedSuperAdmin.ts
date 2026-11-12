import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/user.model.js';

const seedSuperAdmin = async (): Promise<void> => {
  try {
    const isConnected = await connectDatabase();
    if (!isConnected) {
      console.error('❌ [Seed] Unable to connect to MongoDB.');
      process.exit(1);
    }

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@silverbusiness.com';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2026!';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      if (admin.role !== 'super_admin') {
        admin.role = 'super_admin';
        await admin.save();
        console.log(`✨ [Seed] Updated existing user '${adminEmail}' to role 'super_admin'.`);
      } else {
        console.log(`ℹ️  [Seed] Super Admin '${adminEmail}' already exists with role 'super_admin'.`);
      }
    } else {
      admin = await User.create({
        name: 'System Super Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '+919876543210',
        role: 'super_admin',
        isActive: true,
        emailVerified: true,
      });
      console.log(`🎉 [Seed] Successfully created Super Admin: ${adminEmail}`);
    }

    console.log('----------------------------------------------------');
    console.log(`Super Admin Credentials:`);
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     super_admin`);
    console.log('----------------------------------------------------');

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error seeding super admin:', error);
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  }
};

seedSuperAdmin();
