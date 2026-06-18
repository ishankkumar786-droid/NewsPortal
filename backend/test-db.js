const mongoose = require('mongoose');
require('dotenv').config();

const testDb = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find users
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  const admin = users.find(u => u.role === 'super_admin');
  
  if (!admin) {
    console.log('No admin found');
    process.exit(1);
  }

  console.log('Admin ID:', admin._id);

  // Find all articles and their statuses
  const articles = await mongoose.connection.db.collection('articles').find({}).toArray();
  console.log('Total articles in DB:', articles.length);
  const statusCounts = articles.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  console.log('DB Status counts:', statusCounts);

  process.exit(0);
};

testDb().catch(console.error);
