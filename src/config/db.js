const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Proje kök dizininde 'project.db' adında bir dosya açar/bağlanır
const dbPath = path.resolve(__dirname, '../../project.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
    } else {
        console.log('SQLite veritabanına başarıyla bağlanıldı.');
    }
});

// Veritabanı tablolarını ilklendirelim (C'deki initialization fonksiyonları)
db.serialize(() => {
    // 1. Kullanıcılar Tablosu
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            userID TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE
        )
    `);

    // 2. LaTeX İfadeleri Tablosu (Senin kurguladığın yapının optimize hali)
    db.run(`
        CREATE TABLE IF NOT EXISTS latex_expressions (
            latex_id TEXT PRIMARY KEY, -- String ID
            userID TEXT NOT NULL,
            title TEXT NOT NULL,
            latexCode TEXT NOT NULL,
            description TEXT,
            tags TEXT, -- SQLite dizi desteklemediği için buraya ["tag1", "tag2"] şeklinde string gömeceğiz
            visibility TEXT NOT NULL CHECK(visibility IN ('public', 'private')),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userID) REFERENCES users(userID)
        )
    `);
});

module.exports = db; // Diğer dosyalarda kullanabilmek için export ediyoruz (C'deki header paylaşımı gibi)