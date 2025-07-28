const mongoose = require("mongoose");

const dbURL = process.env.dbURL;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURL);
    console.log("DB is Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
