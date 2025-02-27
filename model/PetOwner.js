const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { type } = require("os");

const ownerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true   
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true   
    },
    address: {
        type: String,
        required: true   
    },
    image: {
        type: String
    },
    pets: [
        {
            petname: { type: String, required: true },
            type: { type: String, required: true },
            petimage: {type: String},
            petinfo: {type: String},
            openbooking: {
                type: String,
                default: 'no'
            },
            booked: {
                type: String,
                default: 'no'
            },
        }
    ]
});

// Encrypt password using bcrypt
ownerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
ownerSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
ownerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
ownerSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("PetOwner", ownerSchema);
