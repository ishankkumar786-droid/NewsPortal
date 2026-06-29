const mongoose = require('mongoose');
const { User } = require('./dist/models/User');

const uri = "mongodb://i16657213_db_user:Ishank%40123@ac-umqxsci-shard-00-00.rednpwf.mongodb.net:27017,ac-umqxsci-shard-00-01.rednpwf.mongodb.net:27017,ac-umqxsci-shard-00-02.rednpwf.mongodb.net:27017/NewsPortal?ssl=true&replicaSet=atlas-13w14k-shard-0&authSource=admin&retryWrites=true&w=majority";

async function createAdmin() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const admin = await User.create({
      name: 'Birendra Kesarwani',
      email: 'birendrakesarwani4005@gmail.com',
      password: 'Bir@4005',
      role: 'super_admin'
    });
    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
       console.log('Admin already exists!');
       process.exit(0);
    }
    console.error('Error:', error);
    process.exit(1);
  }
}
createAdmin();
