const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// API 1: /user/list - Lấy danh sách users cho sidebar navigation
router.get("/list", async (request, response) => {
    try {
        // Chỉ lấy các fields cần thiết cho navigation sidebar
        const users = await User.find({}, "_id first_name last_name").exec();
        response.status(200).json(users);
    } catch (error) {
        console.error("Error fetching user list:", error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// API 2: /user/:id - Lấy thông tin chi tiết của user
router.get("/:id", async (request, response) => {
    const userId = request.params.id;

    try {
        // Lấy thông tin user với các fields cần thiết cho detailed view
        const user = await User.findById(userId, "_id first_name last_name location description occupation").exec();

        if (!user) {
            return response.status(400).json({ error: "User not found" });
        }

        response.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        response.status(400).json({ error: "Invalid user ID" });
    }
});

module.exports = router;