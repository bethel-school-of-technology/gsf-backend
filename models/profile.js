const mongoose = require("mongoose");
const Joi = require("joi");

const Profile = mongoose.model(
  "Profile",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30
    },
    location: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 55
    },
    bio: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000
    }
  })
);

function validateProfile(profile) {
  const schema = {
    name: Joi.string()
      .min(2)
      .max(30)
      .required(),
    location: Joi.string()
      .min(5)
      .max(55)
      .required(),
    bio: Joi.string()
      .min(10)
      .max(2000)
      .required()
  };

  return Joi.validate(profile, schema);
}

exports.Profile = Profile;
exports.validate = validateProfile;
