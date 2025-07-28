const express = require("express");
const { Register, GetUser } = require("../controllers/userController");
const {
  Login,
  ForgetPassword,
  ResetPassword,
} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

const userRouter = express.Router(); // CREATE A ROUTER object to handle routes for users

userRouter.post("/register", Register);
userRouter.post("/login", Login);
userRouter.get("/getcurrentuser", auth, GetUser);
userRouter.post("/forgetPassword", ForgetPassword);
userRouter.post("/resetPassword", ResetPassword);

module.exports = userRouter; // EXPORT THE ROUTER
