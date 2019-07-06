const mongoose = require("mongoose");
const Joi = require("joi");

const Post = mongoose.model(
  "Post",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100
    },
    date: {
      type: Date,
      default: Date.now
    },
    story: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 4000
    },
    author: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 30
    }
  })
);

function validatePost(post) {
  const schema = {
    title: Joi.string()
      .min(1)
      .max(100)
      .required(),
    story: Joi.string()
      .min(1)
      .max(4000)
      .required(),
    author: Joi.string()
      .min(1)
      .max(30)
      .required()
  };

  return Joi.validate(post, schema);
}

exports.Post = Post;
exports.validate = validatePost;
