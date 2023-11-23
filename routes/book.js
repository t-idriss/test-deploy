const router = require("express").Router();
const Book = require("../models/Book");
const Product = require("../models/Product");
const User = require("../models/User");
const moment= require("moment");
const {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
  verifyToken,
  verifyTokenAndStaff,
} = require("../utils/verifyToken");

//CREATE

router.post("/", async (req, res) => {
  let product = await Product.findById(req.body.product_id);
  let user = await User.findById(req.body.user_id);
  let book = await Book.find({user_id:req.body.user_id, date:req.body.date});

  if (book.length) {
    return res.status(403).json("This date and time are not available!");
  }
  if (!product || !user) {
    return res.status(403).json("Verify credentials!");
  }

  const body = {
    user_id: req.body.user_id,
    product_id: req.body.product_id,
    service: req.body.service,
    type: req.body.type,
    date: req.body.date,
    time: req.body.time,
    city: req.body.city,
    client: {
      full_name: req.body.full_name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
    },
    price: product.price,
    status: "pending",
  };

  const newBook = new Book(body);

  try {
    const savedBook = await newBook.save();
    res.status(200).json(savedBook);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET HOURS AVAILABILITY

router.post("/times", async (req, res) => {
  try {
    const { user_id, date } = req.body;
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const appointments = await Book.find({
      user_id: user_id,
      date: { $gte: formattedDate, $lt: moment(formattedDate).add(1, 'days').format("YYYY-MM-DD") }
    }, {time:1});
    const availability = [];
    for (let hour = 9; hour <= 20; hour++) {
      i=`${hour}:00:00`
      const isAvailable = appointments.some(item => item.time === i);
  
      availability.push({ time: hour, status: isAvailable });
    }
    res.status(200).json(availability);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//UPDATE

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json(err);
  }
});

//UPDATE

router.put("/staff/:id", verifyTokenAndStaff, async (req, res) => {
  if (req.body.status === "paid") {
    return res.status(500).json("Vous n'avez pas l'autorisation");
  }
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json(err);
  }
});

//DELETE

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json("Book item has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ITEM

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL  ITEMS

router.get("/", async (req, res) => {
  const type = req.query.cat;
  try {
    let books;
    if (type) {
      books = await Book.find({ service: type }).sort({ createdAt: -1 });
    } else {
      books = await Book.find().sort({ createdAt: -1 });
    }

    res.status(200).json(books);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL  ITEMS FOR A STAFF MEMBER

router.get("/staff/:idStaff", verifyTokenAndStaff, async (req, res) => {
  const type = req.query.cat;
  try {
    let books;
    if (type) {
      books = await Book.find({
        user_id: req.params.idStaff,
        status: type,
      }).sort({ createdAt: -1 });
    } else {
      books = await Book.find({ user_id: req.params.idStaff }).sort({
        createdAt: -1,
      });
    }
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL  ITEMS BY USER

router.get("/user/:id", verifyTokenAndStaff, async (req, res) => {
  try {
    let books = await Book.find({ user_id: req.params.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
