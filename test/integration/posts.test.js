const request = require("supertest");
const { Post } = require("../../models/post");
const { User } = require("../../models/user");
const mongoose = require("mongoose");

let server;

describe("/api/posts", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    server.close();
    await Post.remove({});
  });

  describe("GET /", () => {
    it("should return all posts", async () => {
      const posts = [{ name: "post1" }, { name: "post2" }];

      await Post.collection.insertMany(posts);

      const res = await request(server).get("/api/posts");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === "post1")).toBeTruthy();
      expect(res.body.some(g => g.name === "post2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a post if valid id is passed", async () => {
      const post = new Post({ name: "post1" });
      await post.save();

      const res = await request(server).get(
        "/api/posts/" + post._id
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", post.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/posts/1");

      expect(res.status).toBe(404);
    });

    it("should return 404 if no post with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/posts/" + id);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post("/api/posts")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "post1";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if post is less than 5 characters", async () => {
      name = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if post is more than 50 characters", async () => {
      name = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the post if it is valid", async () => {
      await exec();

      const post = await Post.find({ name: "post1" });

      expect(post).not.toBeNull();
    });

    it("should return the post if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "post1");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let newName;
    let post;
    let id;

    const exec = async () => {
      return await request(server)
        .put("/api/posts/" + id)
        .set("x-auth-token", token)
        .send({ name: newName });
    };

    beforeEach(async () => {
      post = new Post({ name: "post1" });
      await post.save();

      token = new User().generateAuthToken();
      id = post._id;
      newName = "updatedName";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if post is less than 5 characters", async () => {
      newName = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if post is more than 50 characters", async () => {
      newName = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if post with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update the post if input is valid", async () => {
      await exec();

      const updatedPost = await Post.findById(post._id);

      expect(updatedPost.name).toBe(newName);
    });

    it("should return the updated post if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newName);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let post;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/posts/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      post = new Post({ name: "post1" });
      await post.save();

      id = post._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no post with the given id was found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the post if input is valid", async () => {
      await exec();

      const postInDb = await Post.findById(id);

      expect(postInDb).toBeNull();
    });

    it("should return the removed post", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", post._id.toHexString());
      expect(res.body).toHaveProperty("name", post.name);
    });
  });
});
