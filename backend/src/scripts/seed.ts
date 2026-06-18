import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Category } from '../models/Category';
import dns from 'dns';

// Fix Node.js DNS resolution issues
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore
}

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected successfully!');

    // 1. Clean existing seed data
    console.log('Cleaning existing users and categories...');
    await User.deleteMany({ email: { $in: ['admin@newsportal.com', 'reporter@newsportal.com'] } });
    
    // We will delete all categories to avoid duplicates
    await Category.deleteMany({});

    // 2. Create Admin and Reporter
    console.log('Creating Admin and Reporter accounts...');
    
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@newsportal.com',
      password: 'Password123!',
      role: 'super_admin',
      isEmailVerified: true
    });

    await User.create({
      name: 'John Reporter',
      email: 'reporter@newsportal.com',
      password: 'Password123!',
      role: 'reporter',
      isEmailVerified: true
    });

    console.log('Users created:');
    console.log(`- Admin: admin@newsportal.com / Password123!`);
    console.log(`- Reporter: reporter@newsportal.com / Password123!`);

    // 3. Create Categories
    console.log('Creating initial categories...');
    const categoriesData = [
      { name: 'Politics', slug: 'politics', color: '#e63946', description: 'National and international politics, policy, elections, and government updates.', order: 1, createdBy: admin._id },
      { name: 'Technology', slug: 'technology', color: '#f4a261', description: 'Gadgets, software updates, AI advancements, and startup features.', order: 2, createdBy: admin._id },
      { name: 'Business', slug: 'business', color: '#2a9d8f', description: 'Economy news, financial markets, personal finance, and corporate changes.', order: 3, createdBy: admin._id },
      { name: 'Entertainment', slug: 'entertainment', color: '#e9c46a', description: 'Celebrity news, movie reviews, pop culture, and events.', order: 4, createdBy: admin._id },
      { name: 'Sports', slug: 'sports', color: '#264653', description: 'Football, cricket, basketball, olympics, and major sporting news.', order: 5, createdBy: admin._id },
      { name: 'Crime', slug: 'crime', color: '#1d3557', description: 'Local and global crime reports, legal cases, and investigation logs.', order: 6, createdBy: admin._id },
      { name: 'Others', slug: 'others', color: '#6B7280', description: 'Articles that do not fit into other specific categories.', order: 7, createdBy: admin._id }
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`Successfully seeded ${categories.length} categories.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
