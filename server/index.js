import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { db, seedDatabase, fetchTMDBPoster } from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "aryan_admin";
const BIRTHDAY_ANSWER = "4 feb";

app.use(cors());
app.use(express.json());

// Serve static files in production
app.use(express.static(path.join(__dirname, "../dist")));

// ── Auth Routes ────────────────────────────────────────────
app.post("/api/auth", (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ error: "Answer required" });

  const normalized = answer
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Match variations: "4 feb", "4th feb", "4th february", "feb 4", "february 4", "04 02", "4 02"
  const validPatterns = [
    /4\s*(th)?\s*feb/,
    /feb\w*\s*4/,
    /04\s*02/,
    /4\s*02/,
    /0?4\s*0?2/,
  ];

  const isValid = validPatterns.some((pattern) => pattern.test(normalized));

  if (isValid) {
    return res.json({ success: true, token: "bollyrecco_authenticated" });
  }
  return res.status(401).json({ error: "Wrong answer! Try again 🎬" });
});

app.post("/api/admin-auth", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: "bollyrecco_admin" });
  }
  return res.status(401).json({ error: "Invalid admin password" });
});

// ── Movie Routes ───────────────────────────────────────────
app.get("/api/movies", async (req, res) => {
  const { genre } = req.query;
  let movies;

  if (genre && genre !== "All") {
    movies = await db
      .prepare(
        `
      SELECT m.*, r.watched, r.rating, r.review_text
      FROM movies m
      LEFT JOIN reviews r ON m.id = r.movie_id
      WHERE m.genre LIKE ?
      ORDER BY m.created_at DESC, m.id DESC
    `
      )
      .all(`%${genre}%`);
  } else {
    movies = await db
      .prepare(
        `
      SELECT m.*, r.watched, r.rating, r.review_text
      FROM movies m
      LEFT JOIN reviews r ON m.id = r.movie_id
      ORDER BY m.created_at DESC, m.id DESC
    `
      )
      .all();
  }

  res.json(movies);
});

app.get("/api/movies/:id", async (req, res) => {
  const movie = await db
    .prepare(
      `
    SELECT m.*, r.watched, r.rating, r.review_text
    FROM movies m
    LEFT JOIN reviews r ON m.id = r.movie_id
    WHERE m.id = ?
  `
    )
    .get(req.params.id);

  if (!movie) return res.status(404).json({ error: "Movie not found" });
  res.json(movie);
});

app.post("/api/movies", async (req, res) => {
  const { title, genre, year, description } = req.body;
  if (!title || !genre) {
    return res.status(400).json({ error: "Title and genre are required" });
  }

  let poster_url = null;
  let tmdb_id = null;

  // Try TMDB
  const tmdbData = await fetchTMDBPoster(title, year);
  if (tmdbData) {
    poster_url = tmdbData.poster_url;
    tmdb_id = tmdbData.tmdb_id;
  }

  const result = await db
    .prepare(
      `INSERT INTO movies (title, genre, year, description, poster_url, tmdb_id) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(title, genre, year || null, description || "", poster_url, tmdb_id);

  // Create empty review entry
  await db.prepare(
    `INSERT INTO reviews (movie_id, watched, rating, review_text) VALUES (?, 0, 0, '')`
  ).run(result.lastInsertRowid);

  const movie = await db
    .prepare(
      `
    SELECT m.*, r.watched, r.rating, r.review_text
    FROM movies m
    LEFT JOIN reviews r ON m.id = r.movie_id
    WHERE m.id = ?
  `
    )
    .get(result.lastInsertRowid);

  res.json(movie);
});

app.put("/api/movies/:id", async (req, res) => {
  const { title, genre, year, description } = req.body;
  const existing = await db.prepare("SELECT * FROM movies WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Movie not found" });

  // Re-fetch TMDB poster if title changed
  let poster_url = existing.poster_url;
  let tmdb_id = existing.tmdb_id;
  if (title && title !== existing.title) {
    const tmdbData = await fetchTMDBPoster(title, year || existing.year);
    if (tmdbData) {
      poster_url = tmdbData.poster_url;
      tmdb_id = tmdbData.tmdb_id;
    }
  }

  await db.prepare(
    `UPDATE movies SET title=?, genre=?, year=?, description=?, poster_url=?, tmdb_id=? WHERE id=?`
  ).run(
    title || existing.title,
    genre || existing.genre,
    year || existing.year,
    description !== undefined ? description : existing.description,
    poster_url,
    tmdb_id,
    req.params.id
  );

  const movie = await db
    .prepare(
      `
    SELECT m.*, r.watched, r.rating, r.review_text
    FROM movies m
    LEFT JOIN reviews r ON m.id = r.movie_id
    WHERE m.id = ?
  `
    )
    .get(req.params.id);

  res.json(movie);
});

app.delete("/api/movies/:id", async (req, res) => {
  const existing = await db.prepare("SELECT * FROM movies WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Movie not found" });

  await db.prepare("DELETE FROM reviews WHERE movie_id = ?").run(req.params.id);
  await db.prepare("DELETE FROM movies WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ── Review Routes ──────────────────────────────────────────
app.put("/api/movies/:id/review", async (req, res) => {
  const { watched, rating, review_text } = req.body;
  const movieId = Number(req.params.id);

  const existing = await db
    .prepare("SELECT * FROM reviews WHERE movie_id = ?")
    .get(movieId);

  if (existing) {
    await db.prepare(
      `UPDATE reviews SET watched=?, rating=?, review_text=?, updated_at=CURRENT_TIMESTAMP WHERE movie_id=?`
    ).run(
      watched !== undefined ? (watched ? 1 : 0) : existing.watched,
      rating !== undefined ? Number(rating) : existing.rating,
      review_text !== undefined ? review_text : existing.review_text,
      movieId
    );
  } else {
    await db.prepare(
      `INSERT INTO reviews (movie_id, watched, rating, review_text) VALUES (?, ?, ?, ?)`
    ).run(movieId, watched ? 1 : 0, Number(rating) || 0, review_text || "");
  }

  const movie = await db
    .prepare(
      `
    SELECT m.*, r.watched, r.rating, r.review_text
    FROM movies m
    LEFT JOIN reviews r ON m.id = r.movie_id
    WHERE m.id = ?
  `
    )
    .get(movieId);

  res.json(movie);
});

// ── Suggestions Routes ───────────────────────────────────────
app.get("/api/suggestions", async (req, res) => {
  const suggestions = await db.prepare("SELECT * FROM suggestions ORDER BY created_at DESC").all();
  res.json(suggestions);
});

app.post("/api/suggestions", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  
  const result = await db.prepare("INSERT INTO suggestions (title) VALUES (?)").run(title);
  const suggestion = await db.prepare("SELECT * FROM suggestions WHERE id = ?").get(result.lastInsertRowid);
  res.json(suggestion);
});

app.delete("/api/suggestions/:id", async (req, res) => {
  await db.prepare("DELETE FROM suggestions WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ── Genres Route ───────────────────────────────────────────
app.get("/api/genres", async (req, res) => {
  const movies = await db.prepare("SELECT genre FROM movies").all();
  const genreSet = new Set();
  movies.forEach((m) => {
    m.genre.split(",").forEach((g) => genreSet.add(g.trim()));
  });
  res.json(["All", ...Array.from(genreSet).sort()]);
});

// SPA fallback
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start server
async function start() {
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`\n🎬 BollyRecco server running on http://localhost:${PORT}`);
    console.log(`🍿 API ready at http://localhost:${PORT}/api\n`);
  });
}

start();
