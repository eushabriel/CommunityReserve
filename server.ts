import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("community_reserve.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'resident'
  );

  CREATE TABLE IF NOT EXISTS facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    facility_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    purpose TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
  );
`);

// Seed initial facilities if empty
const facilitiesCount = db.prepare("SELECT COUNT(*) as count FROM facilities").get() as { count: number };
if (facilitiesCount.count === 0) {
  const insert = db.prepare("INSERT INTO facilities (name, description, capacity, image_url) VALUES (?, ?, ?, ?)");
  insert.run("Main Hall", "Spacious hall for large events and gatherings.", 200, "https://picsum.photos/seed/hall/800/600");
  insert.run("Basketball Court", "Standard size court for sports activities.", 50, "https://picsum.photos/seed/court/800/600");
  insert.run("Conference Room", "Quiet room for meetings and small workshops.", 20, "https://picsum.photos/seed/meeting/800/600");
  insert.run("Community Garden", "Outdoor space for community gardening events.", 100, "https://picsum.photos/seed/garden/800/600");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/facilities", (req, res) => {
    const facilities = db.prepare("SELECT * FROM facilities").all();
    res.json(facilities);
  });

  app.post("/api/register", (req, res) => {
    const { email, password, name } = req.body;
    // For testing: make the specific user an admin
    const role = email === 'polgabriel09@gmail.com' ? 'admin' : 'resident';
    try {
      const info = db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(email, password, name, role);
      res.json({ id: info.lastInsertRowid, email, name, role });
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/reservations", (req, res) => {
    const { userId, role } = req.query;
    let reservations;
    if (role === 'admin') {
      reservations = db.prepare(`
        SELECT r.*, u.name as user_name, f.name as facility_name 
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN facilities f ON r.facility_id = f.id
        ORDER BY r.created_at DESC
      `).all();
    } else {
      reservations = db.prepare(`
        SELECT r.*, f.name as facility_name 
        FROM reservations r
        JOIN facilities f ON r.facility_id = f.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `).all(userId);
    }
    res.json(reservations);
  });

  app.post("/api/reservations", (req, res) => {
    const { userId, facilityId, startTime, endTime, purpose } = req.body;
    
    // Check for conflicts
    const conflict = db.prepare(`
      SELECT * FROM reservations 
      WHERE facility_id = ? 
      AND status = 'approved'
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (? <= start_time AND ? >= end_time)
      )
    `).get(facilityId, startTime, startTime, endTime, endTime, startTime, endTime);

    if (conflict) {
      return res.status(409).json({ error: "Facility is already booked for this time slot." });
    }

    const info = db.prepare(`
      INSERT INTO reservations (user_id, facility_id, start_time, end_time, purpose) 
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, facilityId, startTime, endTime, purpose);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/reservations/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE reservations SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
