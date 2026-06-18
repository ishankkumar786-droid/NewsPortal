import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Article } from './src/models/Article';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const articles = await Article.find().sort({ createdAt: -1 }).limit(2).lean();
  console.log(JSON.stringify(articles.map(a => ({
    title: a.title,
    featuredImage: a.featuredImage
  })), null, 2));
  process.exit(0);
}

check().catch(console.error);
