import express from "express";
import {
  getUser,
  getProfile,
  updateProfile,
  getUserPosts,
  followUser,
  searchUsers,
  getSuggestions,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/suggestions", protect, getSuggestions);
router.get("/search", protect, searchUsers);
router.get("/profile/:id", protect, getProfile);
router.get("/:id", protect, getUser);
router.put("/profile/:id", protect, updateProfile);
router.get("/:id/posts", protect, getUserPosts);
router.put("/:id/follow", protect, followUser);
router.put("/:id/accept-request", protect, acceptFollowRequest);
router.put("/:id/reject-request", protect, rejectFollowRequest);

export default router;