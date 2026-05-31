const userService = require('../services/userService');

exports.register = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: "Username zorunludur." });
        
        const result = await userService.createUser(username);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};