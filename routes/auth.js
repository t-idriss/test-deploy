const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} = require("../utils/verifyToken");

//REGISTER

router.post("/register", async (req, res) => {
  const newUser = new User({
    full_name: req.body.full_name,
    email: req.body.email,
    phone: req.body.phone,
    role: "admin",
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADD USER

router.post("/register/admin", verifyTokenAndAdmin, async (req, res) => {
  let pass = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.MAIL_PASS,
    },
  });

  // Les détails de l'e-mail
  let mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Avis d'ajout chez CAVABLEED",
    text: `Vous avez été ajouter comme ${req.body.role} chez CAVABLEED. Votre mot de passe est le: ${pass}`,
  };

  // Envoyez l'e-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("E-mail envoyé: " + info.response);
    }
  });

  const newUser = new User({
    full_name: req.body.full_name,
    email: req.body.email,
    phone: req.body.phone,
    password: CryptoJS.AES.encrypt(pass, process.env.PASS_SEC).toString(),
    role: req.body.role,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  if (req.body.email === "") {
    res.status(500).json("email can't be empty!!");
  } else {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).json("wrong credentials");
      }

      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SEC
      );
      const correctPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

      if (correctPassword !== req.body.password) {
        return res.status(401).json("wrong credentials");
      }

      const accessToken = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
      );

      const { password, phone, email, full_name, ...others } = user._doc;

      res.status(200).json({ ...others, accessToken });
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

//UPDATE PASSWORD

router.put("/password/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password === "") {
    return res.status(500).json("password can't be empty!!");
  }
  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    return res.status(401).json("wrong credentials");
  }

  const hashedPassword = CryptoJS.AES.decrypt(
    user.password,
    process.env.PASS_SEC
  );
  const correctPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

  if (correctPassword !== req.body.lastpassword) {
    return res.status(401).json("wrong credentials");
  } else {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//RECOVER PASSWORD

router.post("/password/recovery", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(401).json("wrong credentials");
  }

  let pass = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.MAIL_PASS,
    },
  });

  // E-mail details
  let mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: `Récuperation de mot de passe chez CAVABLEED`,
    text: `Vous avez demandez à récuperer votre mot de passe. Votre nouveau mot de passe est le: ${pass}`,
  };

  // Send e-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("E-mail envoyé: " + info.response);
    }
  });

  let body = {
    password: CryptoJS.AES.encrypt(pass, process.env.PASS_SEC).toString(),
  };

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
