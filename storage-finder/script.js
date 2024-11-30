// Install better-sqlite3 via npm first: npm install better-sqlite3
const Database = require('better-sqlite3');

// Create/connect to SQLite database
const db = new Database('storage.db', { verbose: console.log });

// Create tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK(role IN ('student', 'admin'))
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    found_date DATE,
    status TEXT DEFAULT 'unclaimed' CHECK(status IN ('unclaimed', 'claimed', 'processed')),
    image_url TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS found_items (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    found_date DATE NOT NULL,
    location TEXT,
    item_id INTEGER,
    found_by_user_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    FOREIGN KEY (found_by_user_id) REFERENCES user(user_id)
  )
`).run();

// Example insert functions
function insertUser(name, email, phone, role) {
  const stmt = db.prepare('INSERT INTO user (name, email, phone, role) VALUES (?, ?, ?, ?)');
  return stmt.run(name, email, phone, role);
}

function insertItem(item_name, description, category, found_date, image_url) {
  const stmt = db.prepare('INSERT INTO items (item_name, description, category, found_date, image_url) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(item_name, description, category, found_date, image_url);
}

// Example query function
function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM user WHERE email = ?');
  return stmt.get(email);
}

module.exports = { 
  db, 
  insertUser, 
  insertItem, 
  getUserByEmail 
};