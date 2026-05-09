import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, "bollyrecco.db")}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Wrapper to mimic better-sqlite3 API but with async/await
const db = {
  prepare: (sql) => ({
    all: async (...args) => (await client.execute({ sql, args })).rows,
    get: async (...args) => (await client.execute({ sql, args })).rows[0],
    run: async (...args) => {
      const res = await client.execute({ sql, args });
      return { lastInsertRowid: res.lastInsertRowid };
    }
  }),
  exec: async (sql) => await client.execute(sql),
};

// Create tables
async function initDB() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      year INTEGER,
      description TEXT,
      poster_url TEXT,
      tmdb_id INTEGER,
      rating_avg REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL UNIQUE,
      watched INTEGER DEFAULT 0,
      rating INTEGER DEFAULT 0,
      review_text TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

const SEED_MOVIES = [
  {
    title: "Zindagi Na Milegi Dobara",
    genre: "Adventure, Drama",
    year: 2011,
    description:
      "Three friends set out on a road trip across Spain, rediscovering life, love, and friendship along the way. A visual masterpiece about living life to the fullest.",
    tmdb_search: "Zindagi Na Milegi Dobara",
  },
  {
    title: "Bahubali: The Beginning",
    genre: "Action, Fantasy",
    year: 2015,
    description:
      "An epic tale of a warrior prince who discovers his royal heritage and battles to reclaim his kingdom. Visual spectacle redefined for Indian cinema.",
    tmdb_search: "Baahubali The Beginning",
  },
  {
    title: "Bahubali 2: The Conclusion",
    genre: "Action, Fantasy",
    year: 2017,
    description:
      "The epic conclusion revealing why Kattappa killed Bahubali. A grand saga of betrayal, love, and the ultimate triumph of good over evil.",
    tmdb_search: "Baahubali 2 The Conclusion",
  },
  {
    title: "13B",
    genre: "Horror, Thriller",
    year: 2009,
    description:
      "A family moves into a new apartment on the 13th floor and discovers that their TV shows eerie parallels to their lives. Psychological horror at its finest.",
    tmdb_search: "13B Fear Has a New Address",
  },
  {
    title: "RRR",
    genre: "Action, Drama",
    year: 2022,
    description:
      "A fictional story about two legendary Indian revolutionaries and their journey away from home. S.S. Rajamouli's explosive action spectacle.",
    tmdb_search: "RRR",
  },
  {
    title: "Om Shanti Om",
    genre: "Romance, Drama",
    year: 2007,
    description:
      "A junior artist in the 1970s is reborn in the modern era to avenge the murder of his past love. Bollywood magic meets reincarnation drama.",
    tmdb_search: "Om Shanti Om",
  },
  {
    title: "3 Idiots",
    genre: "Comedy, Drama",
    year: 2009,
    description:
      "Two friends embark on a quest to find their long-lost college buddy. Along the way, they recall the fun-filled days of their time together. All izz well!",
    tmdb_search: "3 Idiots",
  },
  {
    title: "Tamasha",
    genre: "Romance, Drama",
    year: 2015,
    description:
      "A man's journey to break free from societal expectations and find his true creative self, intertwined with a beautiful love story.",
    tmdb_search: "Tamasha",
  },
  {
    title: "Kal Ho Naa Ho",
    genre: "Romance, Drama",
    year: 2003,
    description:
      "A terminally ill man teaches his neighbors the true meaning of living life to the fullest while secretly playing cupid for the woman he loves.",
    tmdb_search: "Kal Ho Naa Ho",
  },
  {
    title: "Yeh Jawaani Hai Deewani",
    genre: "Romance, Comedy",
    year: 2013,
    description:
      "A free-spirited traveler and a studious medical student reconnect at a friend's wedding, rekindling old feelings. The ultimate feel-good movie.",
    tmdb_search: "Yeh Jawaani Hai Deewani",
  },
  {
    title: "Jab We Met",
    genre: "Romance, Comedy",
    year: 2007,
    description:
      "A depressed businessman meets a chirpy, talkative girl on a train, and their accidental journey together changes both their lives forever.",
    tmdb_search: "Jab We Met",
  },
  {
    title: "Kartik Calling Kartik",
    genre: "Thriller, Mystery",
    year: 2010,
    description:
      "A shy, under-confident man starts receiving mysterious phone calls from someone claiming to be himself, transforming his life in unexpected ways.",
    tmdb_search: "Karthik Calling Karthik",
  },
];

async function fetchTMDBPoster(searchQuery, year) {
  const apiKey = process.env.TMDB_API_KEY;
  console.log(`Debug: apiKey starts with ${apiKey?.substring(0, 5)}`);
  if (!apiKey || apiKey === "your_tmdb_api_key_here") {
    return null;
  }

  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&year=${year}&language=en-US`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(`Debug: TMDB response for ${searchQuery}: results=${data.results?.length}`);

    if (data.results && data.results.length > 0) {
      const movie = data.results[0];
      return {
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        tmdb_id: movie.id,
      };
    }
  } catch (error) {
    console.error(`TMDB fetch failed for "${searchQuery}":`, error.message);
  }
  return null;
}

async function seedDatabase() {
  await initDB();
  const res = await db.prepare("SELECT COUNT(*) as count FROM movies").get();
  const existingCount = res.count;
  
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} movies. Skipping seed.`);
    return;
  }

  console.log("🎬 Seeding database with Bollywood movies...");

  for (const movie of SEED_MOVIES) {
    console.log(`  🎥 Adding: ${movie.title}...`);

    let poster_url = null;
    let tmdb_id = null;

    const tmdbData = await fetchTMDBPoster(movie.tmdb_search, movie.year);
    if (tmdbData) {
      poster_url = tmdbData.poster_url;
      tmdb_id = tmdbData.tmdb_id;
      console.log(`    ✅ TMDB poster found`);
    } else {
      console.log(`    ⚠️  No TMDB poster (using placeholder)`);
    }

    const result = await db.prepare(`
      INSERT INTO movies (title, genre, year, description, poster_url, tmdb_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(movie.title, movie.genre, movie.year, movie.description, poster_url, tmdb_id);

    await db.prepare(`
      INSERT INTO reviews (movie_id, watched, rating, review_text)
      VALUES (?, 0, 0, '')
    `).run(result.lastInsertRowid);
  }

  console.log("✅ Database seeded successfully!");
}

export { db, seedDatabase, fetchTMDBPoster, initDB };
