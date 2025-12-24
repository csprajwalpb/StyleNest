const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const User = require("../models/User");

//  Add to wishlist
router.post("/add/:productId", fetchUser, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.wishlist.includes(req.params.productId)) {
    return res.status(400).json({ msg: "Already in wishlist" });
  }

  user.wishlist.push(req.params.productId);
  await user.save();

  res.json({ msg: "Added to wishlist" });
});

//  Remove from wishlist
router.delete("/remove/:productId", fetchUser, async (req, res) => {
  const user = await User.findById(req.user.id);

  user.wishlist = user.wishlist.filter(
    id => id.toString() !== req.params.productId
  );

  await user.save();
  res.json({ msg: "Removed from wishlist" });
});

//  Get wishlist
router.get("/", fetchUser, async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json(user.wishlist);
});

module.exports = router;
