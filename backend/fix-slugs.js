/**
 * Migration script: Fix empty/broken slugs for Hindi (non-Latin) articles.
 * 
 * Run: node fix-slugs.js
 */
const mongoose = require('mongoose');
const slugify = require('slugify');
const { transliterate } = require('transliteration');
require('dotenv').config();

async function fixSlugs() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const db = mongoose.connection.db;
  const articles = await db.collection('articles').find({}).toArray();

  let fixed = 0;
  for (const article of articles) {
    const slug = article.slug;
    // Fix articles with empty, missing, or very short slugs (likely broken)
    if (!slug || slug.trim() === '' || slug.startsWith('-')) {
      const transliterated = transliterate(article.title);
      let baseSlug = slugify(transliterated, { lower: true, strict: true, trim: true });
      if (!baseSlug) {
        baseSlug = article._id.toHexString().slice(-8);
      }

      // Ensure unique
      let newSlug = baseSlug;
      let counter = 1;
      while (await db.collection('articles').findOne({ slug: newSlug, _id: { $ne: article._id } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      await db.collection('articles').updateOne(
        { _id: article._id },
        { $set: { slug: newSlug } }
      );
      console.log(`Fixed: "${article.title}" -> slug: "${newSlug}" (was: "${slug}")`);
      fixed++;
    }
  }

  console.log(`\nDone! Fixed ${fixed} article(s) out of ${articles.length} total.`);
  process.exit(0);
}

fixSlugs().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
