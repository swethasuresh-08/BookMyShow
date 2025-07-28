const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const EmailHelper = require("../utils/EmailHelper");
const bcrypt = require("bcrypt");
const Register = async (req, res) => {
  try {
    console.log("hello");
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.send({
        sucess: false,
        message: "User already exists",
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = new User({
      ...req.body,
      password: hashedPassword,
    });
    await newUser.save();
    res.send({
      success: true,
      message: "Registration Successfull, Please login",
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const Login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send({
        success: false,
        message: "User not found, Please register",
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const isMatch = await bcrypt.compare(req.body.password, hashedPassword);
    if (!isMatch) {
      return res.send({
        success: false,
        message: "Invalid Password",
      });
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.send({
      success: true,
      message: "Login Successful",
      data: token,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const GetUser = async (req, res) => {
  console.log(req.headers["authorization"]);
  const user = await User.findById(req.userId).select("-password");
  res.send({
    success: true,
    message: "User Authorized",
    data: user,
  });
};

const ForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (email == undefined) {
      return res.status(401).json({
        status: "failure",
        message: "Please enter the email for forget Password",
      });
    }
    let user = await User.findOne({ email: email });
    if (user == null) {
      return res.status(404).json({
        status: false,
        message: "user not found",
      });
    }
    // 90000 - 99999
    if (user?.otp && Date.now() < user?.otpExpiry) {
      return res.status(401).json({
        status: false,
        message: "otp exisit, check your mail",
      });
    }
    const otp = Math.floor(Math.random() * 10000 + 90000);
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    await EmailHelper("otp.html", email, {
      name: user.name,
      otp: user.otp,
    });
    res.status(200).json({
      success: true,
      message: "otp has been sent",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

const ResetPassword = async (req, res) => {
  try {
    const { password, otp } = req.body;
    if (password == undefined || otp == undefined) {
      return res.status(401).json({
        success: false,
        message: "invalid request",
      });
    }
    const user = await User.findOne({ otp: otp });
    if (user == null) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    if (Date.now() > user.otpExpiry) {
      return res.status(401).json({
        success: false,
        message: "otp expired",
      });
    }
    user.password = password;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  Register,
  Login,
  GetUser,
  ForgetPassword,
  ResetPassword,
};
