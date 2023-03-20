const mongoose = require("mongoose");
require("dotenv").config();
const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log("Error connecting to Mongodb", err.message);
  });
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
  },
  phoneNumber: {
    type: String,
    minLength: 8,
    validate: {
      validator: (s) => /^\d{2,3}-\d{5,}$/.test(s),
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "User phone number required"],
  },
});
personSchema.options.toJSON = {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
};
module.exports = mongoose.model("Person", personSchema);
