const express = require("express");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const router = express.Router();

// API 3: /photosOfUser/:id - Lấy tất cả photos của user kèm comments
router.get("/photosOfUser/:id", async (request, response) => {
  const userId = request.params.id;
  
  try {
    // Kiểm tra user có tồn tại không
    const userExists = await User.findById(userId).exec();
    if (!userExists) {
      return response.status(400).json({ error: "User not found" });
    }

    // Lấy tất cả photos của user
    const photos = await Photo.find({ user_id: userId }).exec();

    // Xử lý từng photo để lấy thông tin comments và user của comments
    const photosWithDetails = await Promise.all(
      photos.map(async (photo) => {
        // Tạo object mới thay vì modify Mongoose object
        const photoObject = {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: []
        };

        // Xử lý comments nếu có
        if (photo.comments && photo.comments.length > 0) {
          // Lấy thông tin user cho mỗi comment
          photoObject.comments = await Promise.all(
            photo.comments.map(async (comment) => {
              // Lấy thông tin user của comment (chỉ lấy fields cần thiết)
              const commentUser = await User.findById(
                comment.user_id,
                "_id first_name last_name"
              ).exec();

              return {
                _id: comment._id,
                comment: comment.comment,
                date_time: comment.date_time,
                user: commentUser ? {
                  _id: commentUser._id,
                  first_name: commentUser.first_name,
                  last_name: commentUser.last_name
                } : null
              };
            })
          );
        }

        return photoObject;
      })
    );

    response.status(200).json(photosWithDetails);
  } catch (error) {
    console.error("Error fetching photos:", error);
    response.status(400).json({ error: "Invalid user ID" });
  }
});

module.exports = router;