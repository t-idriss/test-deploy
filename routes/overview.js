const router = require("express").Router();
const User = require("../models/User");
const Book = require("../models/Book");
const { verifyTokenAndAdmin } = require("../utils/verifyToken");

//GET ALL  ITEMS

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const books = await Book.find();
    const earnings = books.reduce(
      (acc, book) => acc + parseFloat(book.price),
      0
    );
    const validatedBooks = books.filter((book) => book.status === "paid");
    const balance = validatedBooks.reduce(
      (acc, book) => acc + parseFloat(book.price),
      0
    );
    const totalAppointments = books.length;
    const validatedAppointments = validatedBooks.length;

    // Calcul du nombre total des books du mois en cours
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthAppointments = books.filter((book) => {
      const bookDate = new Date(book.createdAt);
      return bookDate >= firstDayOfMonth && bookDate <= lastDayOfMonth;
    }).length;

    // Calcul du nombre total des books de la journée en cours
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    const dayAppointments = books.filter((book) => {
      const bookDate = new Date(book.createdAt);
      return bookDate >= startOfDay && bookDate <= endOfDay;
    }).length;

    const dayBooks = await Book.find({
      date: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() }
    });

    const lastUsers = await User.find({role:"user"}, { password: 0 })
      .sort({ createdAt: -1 }) 
      .limit(4);

    const lastAppointments = await Book.find()
      .sort({ createdAt: -1 }) 
      .limit(5);

    const bookPerMonth = await Book.aggregate([
      {
        $project: {
          month: { $month: { $dateFromString: { dateString: "$date" } } },
          service: 1
        }
      },
      {
        $group: {
          _id: "$month",
          coiffure: { $sum: { $cond: [{ $eq: ["$service", "coiffure"] }, 1, 0] } },
          couture: { $sum: { $cond: [{ $eq: ["$service", "couture"] }, 1, 0] } }
        }
      }
    ]);

    
    const em = await Book.aggregate([
      {
        $match: {
          status: "paid",
          date: {
            $gte: firstDayOfMonth.toISOString(),
            $lte: lastDayOfMonth.toISOString()
          }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $toDouble: "$price" } }
        }
      }
    ]);
    
    const monthEarnings = em[0] ? em[0].totalEarnings : 0;

    const overview = {
      earnings,
      balance,
      totalAppointments,
      validatedAppointments,
      monthAppointments,
      dayAppointments,
      dayBooks,
      bookPerMonth,
      monthEarnings,
      lastUsers,
      lastAppointments
    };

    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
