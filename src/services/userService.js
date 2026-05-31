const db = require('../config/db');

const userService = {
    /**
     * Yeni bir kullanıcı oluşturur (Register).
     */
    createUser: (username) => {
        return new Promise((resolve, reject) => {
            // Basit bir benzersiz ID üretimi
            const userID = 'user_' + Math.random().toString(36).substr(2, 9);
            const query = `INSERT INTO users (userID, username) VALUES (?, ?)`;
            
            db.run(query, [userID, username], function(err) {
                if (err) return reject(err);
                resolve({ userID, username });
            });
        });
    }
};

module.exports = userService;