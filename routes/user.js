const router = require("express").Router();
const User = require("../models/User");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../utils/verifyToken");

//UPDATE

router.put("/", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(err);
  }
});

//UPDATE STATE

router.put("/state/:userId", verifyTokenAndAdmin, async (req, res) => {
  let status = false;
  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(400).json("user not found!!");
  }

  if (user.state === false) {
    status = true;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        state: status,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(err);
  }
});

//UPDATE USER - ADMIN

router.put("/update", verifyTokenAndAdmin, async (req, res) => {

  const user = await User.findById(req.body._id);

  if (!user) {
    res.status(400).json("user not found!!");
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.body._id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//DELETE

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET MY INFOS

router.get("/my-info", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { password, ...others } = user._doc;

    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER

router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const { password, ...others } = user._doc;

    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL BLOGGER

router.get("/bloggers", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find({ role: "blogger" }, { password: 0 })
          .sort({ createdAt: -1 })
          .limit(query)
      : await User.find({ role: "blogger" }, { password: 0 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL TAILOR

router.get("/tailors", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find({ role: "tailor" })
          .sort({ createdAt: -1 }, { password: 0 })
          .limit(query)
      : await User.find({ role: "tailor" }, { password: 0 }).sort({
          createdAt: -1,
        });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL HAIRDRESSER

router.get("/taillors", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find({ role: "hairdresser" })
          .sort({ createdAt: -1 }, { password: 0 })
          .limit(query)
      : await User.find({ role: "hairdresser" }, { password: 0 }).sort({
          createdAt: -1,
        });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL STAFF

router.get("/staff", async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find({ role: { $in: ["tailor", "hairdresser", "blogger"] } })
          .sort({ createdAt: -1 }, { password: 0 })
          .limit(query)
      : await User.find(
          { role: { $in: ["tailor", "hairdresser", "blogger"] } },
          { password: 0 }
        ).sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL STAFF BY SERVICE

router.get("/staffs", async (req, res) => {
  const service = req.query.service;
  try {
    const users = service
      ? await User.find({ role: service}, { password: 0 })
          .sort({ createdAt: -1 })
          .limit()
      : await User.find(
          { role: { $in: ["tailor", "hairdresser", "blogger"] } },
          { password: 0 }
        ).sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

//GET ALL CLIENTS

router.get("/clients", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find({ role: "user" })
          .sort({ createdAt: -1 }, { password: 0 })
          .limit(query)
      : await User.find({ role: "user" }, { password: 0 }).sort({
          createdAt: -1,
        });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS

router.get("/stats", async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
