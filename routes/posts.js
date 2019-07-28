const { Post, validate } = require("../models/post");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// get all posts
router.get("/", auth, async (req, res) => {
  const posts = await Post.find().sort({date: -1});
  res.send(posts);
});

// add a new post
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let post = new Post({
    title: req.body.title,
    story: req.body.story,
    author: req.body.author
  });
  post = await post.save();

  res.send(post);
});

// update a post
router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      story: req.body.story,
      author: req.body.author
    },
    { new: true }
  );

  if (!post)
    return res
      .status(404)
      .send("The post with the given ID was not found");

  res.send(post);
});

// delete a post
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const post = await Post.findByIdAndRemove(req.params.id);

  if (!post)
    return res
      .status(404)
      .send("The post with the given ID was not found");

  res.send(post);
});

// get a single post
router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return res
      .status(404)
      .send("The post with the given ID was not found");

  res.send(post);
});

module.exports = router;
