const db = require('../config/db');

/**
 * LaTeX Expression Service
 * 
 * C Analojisi: Bu dosya veritabanı üzerindeki CRUD işlemlerini yapan bir 'Driver' gibidir.
 * Fonksiyonlar Promise döndürür (C'deki asenkron callback veya event-loop yapısı gibi).
 */

/**
 * DB'den gelen ham satırı işler.
 * Tags verisini güvenli bir şekilde array'e çevirir.
 */
const formatRow = (row) => {
    if (!row) return row;
    try {
        return {
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : []
        };
    } catch (e) {
        return { ...row, tags: [] };
    }
};

const expressionService = {
    /**
     * Yeni bir LaTeX ifadesi oluşturur.
     */
    createExpression: (data) => {
        return new Promise((resolve, reject) => {
            const { latex_id, userID, title, latexCode, description, tags, visibility } = data;
            
            // SQLite dizi desteklemediği için tags dizisini stringify ediyoruz (Serializing a struct)
            const tagsString = JSON.stringify(tags || []);

            const query = `
                INSERT INTO latex_expressions (latex_id, userID, title, latexCode, description, tags, visibility)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(query, [latex_id, userID, title, latexCode, description, tagsString, visibility], function(err) {
                if (err) return reject(err);
                resolve({ latex_id: latex_id, message: "İfade başarıyla oluşturuldu." });
            });
        });
    },

    /**
     * Genel aramada çıkabilecek ifadeleri getirir (Public olanlar).
     * Protected olanlar listelerde gözükmez (Direct Access Only).
     */
    getAllPublic: () => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM latex_expressions WHERE visibility = 'public' ORDER BY createdAt DESC`;
            db.all(query, [], (err, rows) => {
                if (err) return reject(err);
                const formattedRows = (rows || []).map(formatRow);
                resolve(formattedRows);
            });
        });
    },

    /**
     * Spesifik bir ifadeyi ID ile getirir (Pointer ile adrese erişmek gibi).
     * Protected ifadeler burada 'doğrudan link' mantığıyla erişilebilir olur.
     */
    getById: (latex_id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM latex_expressions WHERE latex_id = ?`;
            db.get(query, [latex_id], (err, row) => {
                if (err) return reject(err);
                resolve(formatRow(row));
            });
        });
    },

    /**
     * Kaydı günceller (Memory overwrite gibi).
     */
    updateExpression: (latex_id, data) => {
        return new Promise((resolve, reject) => {
            const { title, latexCode, description, tags, visibility } = data;
            const tagsString = JSON.stringify(tags || []);

            const query = `
                UPDATE latex_expressions 
                SET title = ?, latexCode = ?, description = ?, tags = ?, visibility = ?
                WHERE latex_id = ?
            `;

            db.run(query, [title, latexCode, description, tagsString, visibility, latex_id], function(err) {
                if (err) return reject(err);
                resolve({ updated: this.changes });
            });
        });
    },

    /**
     * Kaydı siler (free() işlemi gibi veriyi uçurur).
     */
    deleteExpression: (latex_id) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM latex_expressions WHERE latex_id = ?`;
            db.run(query, [latex_id], function(err) {
                if (err) return reject(err);
                resolve({ deleted: this.changes });
            });
        });
    },

    /**
     * Kullanıcının kendi özel (private) ifadelerini listeler.
     */
    getByUser: (userID) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM latex_expressions WHERE userID = ?`;
            db.all(query, [userID], (err, rows) => {
                if (err) return reject(err);
                resolve((rows || []).map(formatRow));
            });
        });
    }
};

module.exports = expressionService;