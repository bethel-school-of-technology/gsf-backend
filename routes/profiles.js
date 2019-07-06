const { Profile, validate } = require("../models/profile");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// get all profiles
router.get("/", auth, async (req, res) => {
  const profiles = await Profile.find().sort("name");
  res.send(profiles);
});

// add a new profile
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let profile = new Profile({
    name: req.body.name,
    location: req.body.location,
    bio: req.body.bio
  });
  profile = await profile.save();

  res.send(profile);
});

// update a profile
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const profile = await Profile.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      location: req.body.location,
      bio: req.body.bio
    },
    { new: true }
  );

  if (!profile)
    return res
      .status(404)
      .send("The profile with the given ID was not found");

  res.send(profile);
});

// delete a profile
router.delete("/:id", [auth, admin], async (req, res) => {
  const profile = await Profile.findByIdAndRemove(req.params.id);

  if (!profile)
    return res
      .status(404)
      .send("The profile with the given ID was not found");

  res.send(profile);
});

// get a single profile
router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile)
    return res
      .status(404)
      .send("The profile with the given ID was not found");

  res.send(profile);
});

module.exports = router;
