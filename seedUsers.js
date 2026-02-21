import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import connectDB from './src/config/database.js';

dotenv.config();

const sampleUsers = [
  {
    userId: "100",
    username: "Alice Johnson",
    email: "alice@example.com"
  },
  {
    userId: "200",
    username: "Bob Smith",
    email: "bob@example.com"
  },
  {
    userId: "300",
    username: "Charlie Brown",
    email: "charlie@example.com"
  },
  {
    userId: "400",
    username: "Diana Prince",
    email: "diana@example.com"
  },
  {
    userId: "500",
    username: "Eve Wilson",
    email: "eve@example.com"
  }
];

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (optional - remove if you want to keep existing users)
    console.log('Checking for existing users...');
    const existingCount = await User.countDocuments();
    console.log(`Found ${existingCount} existing users`);

    // Insert sample users
    console.log('Inserting sample users...');
    
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ userId: userData.userId });
      if (existingUser) {
        console.log(`User ${userData.userId} (${userData.username}) already exists, skipping...`);
      } else {
        await User.create(userData);
        console.log(`✓ Created user: ${userData.userId} - ${userData.username}`);
      }
    }

    console.log('\n✅ Sample users seeded successfully!');
    console.log('\nYou can now use these user IDs in your API calls:');
    sampleUsers.forEach(user => {
      console.log(`  - ${user.userId}: ${user.username} (${user.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
