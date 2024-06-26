const router = require("express").Router();
const Blog = require("../models/Blog");
const { verifyTokenAndBlogger } = require("../utils/verifyToken");

//CREATE

router.post("/", verifyTokenAndBlogger, async (req, res) => {
  const newBlog = new Blog({
    user: req.user.id,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    img: req.body.img,
  });

  try {
    const savedBlog = await newBlog.save();
    res.status(200).json(savedBlog);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE

router.put("/:id", verifyTokenAndBlogger, async (req, res) => {
  const body = {
    title: req.body.title,
    description: req.body.description,
  };
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        $set: body,
      },
      { new: true }
    );
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json(error);
  }
});

//DELETE

router.delete("/:id", verifyTokenAndBlogger, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json("Blog item has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ITEM

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL  ITEMS

router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let blogs;
    if (qNew) {
      blogs = await Blog.find()
        .sort({ createdAt: -1 })
        .limit(qNew)
        .populate("user", "full_name")
        .exec();
    } else if (qCategory) {
      blogs = await Blog.find({
        categories: {
          $in: [qCategory],
        },
      })
        .sort({ createdAt: -1 })
        .populate("user", "full_name")
        .exec();
    } else {
      blogs = await Blog.find()
        .sort({ createdAt: -1 })
        .populate("user", "full_name")
        .exec();
    }

    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
