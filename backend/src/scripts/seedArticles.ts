import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Article } from '../models/Article';
import slugify from 'slugify';

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore
}

const articles: {
  title: string;
  summary: string;
  content: string;
  categorySlug: string;
  tags: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  viewCount: number;
  featuredImage: { url: string; publicId: string; alt: string };
}[] = [
  // ── POLITICS ──────────────────────────────────────────────────────────────
  {
    title: 'Parliament Passes Landmark Budget Bill After Weeks of Debate',
    summary: 'The national parliament has passed a historic budget bill that allocates record funds to healthcare and education sectors.',
    content: '<p>After weeks of intense negotiations and heated floor debates, the national parliament passed the landmark Budget Reform Bill late Thursday evening with a decisive majority vote.</p><p>The bill, which allocates an unprecedented increase in funding for public healthcare and primary education, is being hailed by analysts as one of the most significant fiscal reforms in the past two decades.</p><p>Opposition leaders raised concerns about the deficit implications, but the ruling coalition maintained that the long-term economic benefits outweigh short-term borrowing costs.</p><p>The bill now moves to the upper house for final ratification before it can be signed into law by the head of state.</p>',
    categorySlug: 'politics',
    tags: ['parliament', 'budget', 'legislation', 'healthcare'],
    isBreaking: true,
    isFeatured: true,
    viewCount: 4821,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop',
      publicId: 'seed/politics-1',
      alt: 'Parliament building',
    },
  },
  {
    title: 'Prime Minister Announces Early General Election for Next Month',
    summary: 'In a surprise address to the nation, the Prime Minister called for snap elections citing the need for a fresh public mandate.',
    content: '<p>In a surprise televised address that caught even senior members of his own party off guard, the Prime Minister announced Thursday that general elections will be held next month, nearly a year ahead of schedule.</p><p>The announcement immediately sent political parties scrambling to finalize candidate lists and campaign strategies. Opposition parties called the move "calculated" but vowed to be fully prepared.</p><p>Political analysts suggest the ruling party is trying to capitalize on a recent uptick in approval ratings before an expected economic slowdown later in the year.</p><p>Voter registration drives have been fast-tracked, with election authorities confirming all logistics will be in place within the required constitutional timeframe.</p>',
    categorySlug: 'politics',
    tags: ['election', 'prime-minister', 'government', 'voting'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 3102,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop',
      publicId: 'seed/politics-2',
      alt: 'Election campaign rally',
    },
  },
  {
    title: 'Foreign Ministers Hold Emergency Summit Over Regional Border Tensions',
    summary: 'Top diplomats from five nations convened an emergency summit to de-escalate rising tensions along a disputed border region.',
    content: '<p>Foreign ministers from five neighboring nations gathered for an emergency diplomatic summit this week as tensions along a disputed border region reached their highest point in over a decade.</p><p>The two-day closed-door talks, hosted in a neutral capital city, resulted in a joint communiqué calling for immediate military de-escalation and the re-establishment of a demilitarized buffer zone.</p><p>A senior diplomat described the discussions as "frank and at times difficult" but expressed cautious optimism that a formal ceasefire framework could be signed within weeks.</p><p>International observers and human rights groups are monitoring the situation closely, urging all parties to prioritize civilian safety.</p>',
    categorySlug: 'politics',
    tags: ['diplomacy', 'foreign-policy', 'summit', 'border'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 2477,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&auto=format&fit=crop',
      publicId: 'seed/politics-3',
      alt: 'Diplomatic summit meeting',
    },
  },

  // ── TECHNOLOGY ────────────────────────────────────────────────────────────
  {
    title: 'Tech Giant Unveils Next-Generation AI Assistant with Real-Time Reasoning',
    summary: 'A leading technology company has launched a new AI assistant capable of real-time multi-step reasoning, setting a new industry benchmark.',
    content: '<p>One of the world\'s largest technology companies pulled back the curtain on its most advanced AI assistant to date, showcasing capabilities that industry observers are calling a significant leap forward in practical artificial intelligence.</p><p>The new model demonstrates real-time multi-step reasoning, meaning it can break down complex problems, evaluate multiple solution paths, and explain its logic transparently — all within seconds.</p><p>During a live demonstration, the assistant successfully navigated ambiguous legal questions, composed functional code from plain-language descriptions, and diagnosed simulated medical scenarios with a high accuracy rate.</p><p>Privacy advocates have raised questions about data handling, which the company says will be addressed through an upcoming third-party audit program.</p>',
    categorySlug: 'technology',
    tags: ['ai', 'artificial-intelligence', 'tech', 'machine-learning'],
    isBreaking: false,
    isFeatured: true,
    viewCount: 8903,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop',
      publicId: 'seed/technology-1',
      alt: 'AI technology concept',
    },
  },
  {
    title: 'Major Cybersecurity Breach Exposes Millions of User Records Globally',
    summary: 'A sophisticated cyberattack on a cloud infrastructure provider has compromised personal data belonging to millions of users across 40 countries.',
    content: '<p>Security researchers confirmed late Tuesday that a sophisticated cyberattack targeting a major cloud infrastructure provider has resulted in the exposure of personal data belonging to an estimated thirty million users across forty countries.</p><p>The breach, attributed by preliminary forensic analysis to a state-affiliated threat actor, exploited a zero-day vulnerability in widely used authentication middleware that had gone unpatched for several months.</p><p>Affected companies have begun notifying customers and regulators as required under data protection laws, while cybersecurity firms are working around the clock to contain the spread.</p><p>The incident has renewed calls from lawmakers for mandatory cybersecurity standards for critical digital infrastructure.</p>',
    categorySlug: 'technology',
    tags: ['cybersecurity', 'data-breach', 'privacy', 'hacking'],
    isBreaking: true,
    isFeatured: false,
    viewCount: 6214,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop',
      publicId: 'seed/technology-2',
      alt: 'Cybersecurity hacking concept',
    },
  },
  {
    title: 'Electric Vehicle Sales Surpass Petrol Cars for First Time in History',
    summary: 'Global electric vehicle sales have overtaken internal combustion engine cars in monthly sales figures for the first time ever, marking a turning point in automotive history.',
    content: '<p>In a milestone that auto industry veterans once considered decades away, global monthly sales of electric vehicles surpassed those of petrol-powered cars for the first time in recorded history, according to data released by the International Automotive Research Council.</p><p>The shift is being driven by a combination of falling battery costs, expanded charging infrastructure, and increasingly aggressive government incentive programs in major markets including Europe, China, and North America.</p><p>Leading EV manufacturers reported record quarterly deliveries, while traditional automakers noted accelerating declines in their combustion engine lineups.</p><p>Environmental groups called the milestone "a critical turning point" in the transition to sustainable transportation.</p>',
    categorySlug: 'technology',
    tags: ['electric-vehicles', 'ev', 'automotive', 'sustainability'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 5560,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop',
      publicId: 'seed/technology-3',
      alt: 'Electric vehicle charging',
    },
  },

  // ── BUSINESS ──────────────────────────────────────────────────────────────
  {
    title: 'Stock Markets Rally as Inflation Data Comes in Lower Than Expected',
    summary: 'Global stock markets surged following the release of better-than-expected inflation figures, raising hopes for an earlier interest rate cut.',
    content: '<p>Stock markets across North America, Europe, and Asia staged a broad rally on Friday after fresh government data showed inflation cooled more than economists had forecast, stoking optimism that central banks may begin cutting interest rates sooner than previously anticipated.</p><p>The benchmark indices in New York, London, and Frankfurt each closed more than two percent higher, their strongest single-day gains in several months.</p><p>Investors rotated heavily into growth and technology sectors, which are particularly sensitive to interest rate expectations, while bond yields declined sharply.</p><p>Central bank officials cautioned against reading too much into a single month of data, emphasizing that the path back to the two-percent inflation target remains gradual.</p>',
    categorySlug: 'business',
    tags: ['stocks', 'inflation', 'economy', 'markets'],
    isBreaking: false,
    isFeatured: true,
    viewCount: 4100,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
      publicId: 'seed/business-1',
      alt: 'Stock market trading floor',
    },
  },
  {
    title: 'Startup Raises Record Funding Round to Revolutionize Supply Chain Logistics',
    summary: 'A logistics technology startup has closed a record-breaking Series C funding round, attracting investment from some of the world\'s largest venture capital firms.',
    content: '<p>A logistics technology startup announced it has closed a record-breaking Series C funding round, raising three hundred million dollars from a consortium that includes three of the world\'s top five venture capital firms.</p><p>The company, which uses AI-powered route optimization and predictive demand forecasting, claims its platform reduces supply chain costs by an average of twenty-two percent for enterprise clients.</p><p>The fresh capital will be used to expand operations into Southeast Asia and Latin America, where supply chain inefficiencies remain a significant drag on economic productivity.</p><p>The founder described the funding as "validation that fixing broken supply chains is one of the most impactful problems we can solve this decade."</p>',
    categorySlug: 'business',
    tags: ['startup', 'funding', 'logistics', 'venture-capital'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 2890,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop',
      publicId: 'seed/business-2',
      alt: 'Logistics warehouse and supply chain',
    },
  },
  {
    title: 'Central Bank Holds Rates Steady Amid Mixed Economic Signals',
    summary: 'The central bank has voted unanimously to hold interest rates at current levels, citing conflicting data on employment and consumer spending.',
    content: '<p>The central bank\'s monetary policy committee voted unanimously to hold the benchmark interest rate steady at its current level following its quarterly review, as policymakers weigh conflicting signals from the labor market and consumer spending data.</p><p>While unemployment remains near historic lows, recent consumer confidence surveys have shown a notable dip, and manufacturing output has contracted for a second consecutive quarter.</p><p>The governor of the central bank told reporters that the committee remains "data-dependent" and open to adjustments in either direction depending on how economic conditions evolve over the coming months.</p><p>Financial markets had widely anticipated the decision to hold, with most analysts not expecting a rate move until at least the second half of the year.</p>',
    categorySlug: 'business',
    tags: ['central-bank', 'interest-rates', 'monetary-policy', 'economy'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 1980,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop',
      publicId: 'seed/business-3',
      alt: 'Central bank building',
    },
  },

  // ── ENTERTAINMENT ─────────────────────────────────────────────────────────
  {
    title: 'Blockbuster Film Breaks All-Time Opening Weekend Box Office Record',
    summary: 'The highly anticipated sequel to one of cinema\'s most beloved franchises has shattered opening weekend records, grossing over 400 million dollars globally.',
    content: '<p>The long-awaited sequel to one of Hollywood\'s most beloved film franchises has shattered every opening weekend record in cinema history, grossing an estimated four hundred and twelve million dollars across global markets in just three days.</p><p>Critics have praised the film for its stunning visual effects, emotionally resonant storyline, and a career-best performance from its lead actor.</p><p>Audience reception has been equally enthusiastic, with the film scoring one of the highest Cinemascore ratings ever recorded on opening weekend.</p><p>Industry analysts say the performance signals a strong recovery for theatrical cinema following years of disruption from streaming competition and the pandemic.</p>',
    categorySlug: 'entertainment',
    tags: ['movies', 'box-office', 'hollywood', 'cinema'],
    isBreaking: false,
    isFeatured: true,
    viewCount: 9750,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop',
      publicId: 'seed/entertainment-1',
      alt: 'Movie theater cinema',
    },
  },
  {
    title: 'Music Streaming Giant Reports Record Monthly Listeners Crossing One Billion',
    summary: 'The world\'s largest music streaming platform has announced it has crossed one billion monthly active listeners, a milestone that redefines the modern music industry.',
    content: '<p>The world\'s largest music streaming platform announced this week that its monthly active listener count has surpassed one billion for the first time, a watershed moment that underscores the complete transformation of how the world consumes music.</p><p>The platform attributed the milestone to aggressive expansion in emerging markets, improved algorithmic discovery features, and a growing catalog of exclusive podcast and live performance content.</p><p>Independent artists have been among the biggest beneficiaries of the platform\'s growth, with the company reporting that the number of artists earning over one million streams per month has doubled in the past two years.</p><p>Record labels are renegotiating royalty structures in light of the new listener figures, with several smaller labels pushing for a more favorable per-stream payout model.</p>',
    categorySlug: 'entertainment',
    tags: ['music', 'streaming', 'artists', 'digital-media'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 5430,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop',
      publicId: 'seed/entertainment-2',
      alt: 'Music concert crowd',
    },
  },
  {
    title: 'Award Season Kicks Off with Surprise Nominations That Have Everyone Talking',
    summary: 'This year\'s awards season has opened with a series of unexpected nominations, with several debut films and overlooked performances earning well-deserved recognition.',
    content: '<p>The official nominations for this year\'s major film and television awards were revealed this morning, and the industry is buzzing with surprise after several debut productions and long-overlooked performances earned prominent recognition.</p><p>A low-budget independent drama shot over just eighteen days has landed nominations in five major categories including Best Picture, shocking industry veterans who rarely see such productions break through in competitive years.</p><p>Two streaming-only productions have also secured landmark nominations, continuing the blurring of lines between traditional Hollywood and digital-first entertainment.</p><p>Several A-list stars considered frontrunners were notably absent from key acting categories, setting the stage for what promises to be one of the most unpredictable awards seasons in years.</p>',
    categorySlug: 'entertainment',
    tags: ['awards', 'oscars', 'films', 'celebrities'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 4220,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1598387993441-a364f854cfds?w=800&auto=format&fit=crop',
      publicId: 'seed/entertainment-3',
      alt: 'Awards ceremony red carpet',
    },
  },

  // ── SPORTS ────────────────────────────────────────────────────────────────
  {
    title: 'National Football Team Clinches World Cup Qualification with Dramatic Win',
    summary: 'The national football team secured their place at the World Cup with a last-minute winner in a dramatic qualifier that kept millions on the edge of their seats.',
    content: '<p>In a match that will be talked about for generations, the national football team secured World Cup qualification in the dying seconds of their final qualifying fixture, with a dramatic stoppage-time header sending thousands of fans into delirium inside the stadium and millions more watching at home.</p><p>The team, which came into the game needing only a draw, found themselves a goal down with just four minutes remaining before their talismanic captain rose to meet a perfectly flighted corner and plant an unstoppable header into the top corner.</p><p>The manager described the moment as "the greatest I have experienced in football" and dedicated the qualification to the fans who had supported the team through a difficult qualification campaign.</p><p>The team now faces a two-month preparation camp before the World Cup begins, with the squad expected to be announced within the next three weeks.</p>',
    categorySlug: 'sports',
    tags: ['football', 'world-cup', 'soccer', 'qualification'],
    isBreaking: true,
    isFeatured: true,
    viewCount: 12400,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop',
      publicId: 'seed/sports-1',
      alt: 'Football stadium celebration',
    },
  },
  {
    title: 'Tennis Superstar Wins Third Consecutive Grand Slam to Cement Legacy',
    summary: 'The world\'s top-ranked tennis player has claimed a third consecutive Grand Slam title, cementing their status as one of the greatest players in the sport\'s history.',
    content: '<p>The world\'s top-ranked tennis player won a third consecutive Grand Slam title on Sunday, delivering a masterclass in controlled aggression to defeat the defending champion in four sets in a final that lasted nearly four hours.</p><p>The victory placed the player in rare historical company, joining only a handful of athletes ever to win three consecutive major titles across multiple surfaces.</p><p>After the match, an emotional champion dedicated the victory to their coach and family, acknowledging the physical and mental toll of sustaining peak performance across a grueling season.</p><p>Tennis analysts widely agree that the performance is the defining statement of a legacy that is now firmly among the all-time greats of the game.</p>',
    categorySlug: 'sports',
    tags: ['tennis', 'grand-slam', 'championship', 'sports'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 7830,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
      publicId: 'seed/sports-2',
      alt: 'Tennis player on court',
    },
  },
  {
    title: 'Olympic Host City Reveals Spectacular Stadium Design Ahead of Games',
    summary: 'The host city of the upcoming Summer Olympics has unveiled the architectural designs for its main stadium, drawing widespread admiration for its sustainability-focused design.',
    content: '<p>The city set to host the next Summer Olympics unveiled the architectural design of its main Olympic stadium this week, drawing immediate acclaim from architects and sports commentators alike for its groundbreaking approach to sustainable construction.</p><p>The stadium, which will seat eighty thousand spectators, is designed to be entirely carbon-neutral in operation, featuring rooftop solar panels, rainwater harvesting systems, and a modular structure that can be repurposed as a public park and community sports facility after the Games conclude.</p><p>The International Olympic Committee president praised the design as "a blueprint for how future host cities should approach the balance between spectacular spectacle and responsible stewardship."</p><p>Construction is set to begin within the next six months, with a planned completion date eighteen months before the opening ceremony.</p>',
    categorySlug: 'sports',
    tags: ['olympics', 'stadium', 'sports', 'sustainability'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 3340,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop',
      publicId: 'seed/sports-3',
      alt: 'Olympic stadium',
    },
  },

  // ── CRIME ─────────────────────────────────────────────────────────────────
  {
    title: 'International Police Operation Dismantles Major Drug Trafficking Network',
    summary: 'A coordinated multi-country police operation has arrested over 200 suspects and seized billions worth of narcotics in one of the largest anti-trafficking operations in history.',
    content: '<p>Law enforcement agencies from seventeen countries executed simultaneous raids across three continents over a 48-hour period, dismantling one of the world\'s most sophisticated drug trafficking networks in what authorities are calling the largest coordinated operation of its kind.</p><p>More than two hundred suspects were arrested, including several high-ranking cartel operatives who had been under surveillance for nearly three years. Authorities seized an estimated six billion dollars worth of narcotics, along with cash, weapons, and communications infrastructure.</p><p>The operation, which required years of joint intelligence work and undercover infiltration, also led to the freezing of over one billion dollars in assets held through a network of shell companies across multiple jurisdictions.</p><p>Officials emphasized that while this operation represents a significant blow to the network, the broader fight against organized drug crime requires sustained international cooperation.</p>',
    categorySlug: 'crime',
    tags: ['crime', 'drugs', 'police', 'international'],
    isBreaking: true,
    isFeatured: false,
    viewCount: 6700,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop',
      publicId: 'seed/crime-1',
      alt: 'Police operation',
    },
  },
  {
    title: 'High-Profile Financial Fraud Case Goes to Trial After Three-Year Investigation',
    summary: 'A landmark financial fraud case involving hundreds of millions of dollars and dozens of victims has finally reached trial after a three-year investigation.',
    content: '<p>A landmark financial fraud case that has captivated the business world for the past three years finally moved to trial this week, with prosecutors alleging the defendants orchestrated a sophisticated scheme that defrauded hundreds of investors of nearly five hundred million dollars.</p><p>The accused, a former executive at a prominent investment firm, is alleged to have fabricated financial records, misrepresented fund performance, and diverted client funds into personal accounts through a web of offshore entities.</p><p>The prosecution\'s opening statement laid out a detailed timeline of alleged deception spanning nearly a decade, supported by thousands of documents obtained through international legal assistance treaties.</p><p>Defense attorneys maintained their client\'s innocence and argued that the government\'s case rests on misinterpreted accounting practices rather than deliberate criminal intent.</p>',
    categorySlug: 'crime',
    tags: ['fraud', 'financial-crime', 'trial', 'investigation'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 3890,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&auto=format&fit=crop',
      publicId: 'seed/crime-2',
      alt: 'Courtroom justice',
    },
  },
  {
    title: 'City Launches New Community Policing Initiative to Reduce Urban Crime Rates',
    summary: 'A major city has unveiled a new community-focused policing strategy that prioritizes prevention, mental health response, and neighbourhood engagement over reactive enforcement.',
    content: '<p>City authorities unveiled an ambitious new community policing initiative aimed at reducing urban crime rates through prevention-focused engagement rather than solely reactive enforcement, marking a significant shift in how the city approaches public safety.</p><p>The program, which will be piloted in three high-crime districts, places mental health professionals and community mediators alongside police officers for non-violent calls, while dedicated officers will work embedded in local schools and community centers to build trust and address root causes of crime.</p><p>Early data from a smaller pilot run last year showed a twenty-eight percent reduction in repeat offences and a notable improvement in community reporting rates, suggesting residents felt more comfortable engaging with law enforcement.</p><p>Civil liberties advocates broadly welcomed the initiative, while some in law enforcement unions expressed concern about resource allocation and officer safety in certain deployment scenarios.</p>',
    categorySlug: 'crime',
    tags: ['crime', 'community-policing', 'urban', 'public-safety'],
    isBreaking: false,
    isFeatured: false,
    viewCount: 2150,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop',
      publicId: 'seed/crime-3',
      alt: 'Community policing',
    },
  },
];

const seedArticles = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected!');

    // Find reporter and admin
    const reporter = await User.findOne({ role: 'reporter' });
    const admin = await User.findOne({ role: 'super_admin' });

    if (!reporter || !admin) {
      console.error('No reporter or admin found. Run the main seed script first: npx tsx src/scripts/seed.ts');
      process.exit(1);
    }

    console.log(`Using reporter: ${reporter.name} (${reporter.email})`);
    console.log(`Using admin: ${admin.name} (${admin.email})`);

    // Fetch all categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error('No categories found. Run the main seed script first: npx tsx src/scripts/seed.ts');
      process.exit(1);
    }

    const categoryMap = new Map(categories.map((c) => [c.slug, c]));

    // Delete only previously seeded articles (by publicId prefix)
    const seededPublicIds = articles.map((a) => a.featuredImage.publicId);
    await Article.deleteMany({ 'featuredImage.publicId': { $in: seededPublicIds } });
    console.log('Cleared previously seeded articles.');

    const now = new Date();
    let created = 0;

    for (const data of articles) {
      const category = categoryMap.get(data.categorySlug);
      if (!category) {
        console.warn(`Category not found for slug: ${data.categorySlug}, skipping.`);
        continue;
      }

      // Build unique slug
      const baseSlug = slugify(data.title, { lower: true, strict: true, trim: true });
      let slug = baseSlug;
      let counter = 1;
      while (await Article.exists({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const publishDate = new Date(now.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));

      await Article.create({
        title: data.title,
        slug,
        summary: data.summary,
        content: data.content,
        category: category._id,
        tags: data.tags,
        author: reporter._id,
        featuredImage: data.featuredImage,
        galleryImages: [],
        status: 'published',
        isBreaking: data.isBreaking,
        isFeatured: data.isFeatured,
        viewCount: data.viewCount,
        shareCount: 0,
        publishDate,
        publishedAt: publishDate,
        publishedBy: admin._id,
        submittedAt: publishDate,
        reviewedAt: publishDate,
        reviewedBy: admin._id,
        approvedAt: publishDate,
        approvedBy: admin._id,
      });

      created++;
      console.log(`  ✓ [${data.categorySlug}] ${data.title}`);
    }

    // Update article counts per category
    for (const category of categories) {
      const count = await Article.countDocuments({ category: category._id, status: 'published' });
      await Category.findByIdAndUpdate(category._id, { articleCount: count });
    }

    console.log(`\nDone! Seeded ${created} articles across ${categories.length} categories.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedArticles();
