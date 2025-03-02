require("dotenv").config({ path: "./config/config.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const chai = require("chai");
const expect = chai.expect;
const PetSitter = require("../model/PetSitter");

describe("PetSitter Model", () => {
  before(async () => {
    console.log("TEST_DB_URI:", process.env.TEST_DB_URI);
    await mongoose.connect(process.env.TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await PetSitter.deleteMany({});
  });

  it("should hash the password before saving", async () => {
    const sitterData = {
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "1234567890",
      address: "123 Street, City",
      password: "password123",
    };

    const sitter = new PetSitter(sitterData);
    await sitter.save();

    expect(sitter.password).to.not.equal("password123");
    const isMatch = await bcrypt.compare("password123", sitter.password);
    expect(isMatch).to.be.true;
  });

  it("should generate a valid JWT token", async () => {
    const sitterData = {
      name: "Jane Doe",
      email: "janedoe@example.com",
      phone: "9876543210",
      address: "456 Avenue, City",
      password: "password123",
    };

    const sitter = new PetSitter(sitterData);
    await sitter.save();

    const token = sitter.getSignedJwtToken();
    expect(token).to.be.a("string");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).to.equal(sitter._id.toString());
  });

  it("should correctly match passwords", async () => {
    const sitterData = {
      name: "Alice Smith",
      email: "alice@example.com",
      phone: "1112223333",
      address: "789 Boulevard, City",
      password: "password123",
    };

    const sitter = new PetSitter(sitterData);
    await sitter.save();

    const isMatch = await sitter.matchPassword("password123");
    expect(isMatch).to.be.true;

    const isNotMatch = await sitter.matchPassword("wrongpassword");
    expect(isNotMatch).to.be.false;
  });

  it("should generate and hash a reset password token", async () => {
    const sitterData = {
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "4445556666",
      address: "101 Pine St, City",
      password: "password123",
    };

    const sitter = new PetSitter(sitterData);
    await sitter.save();

    const resetToken = sitter.getResetPasswordToken();
    expect(resetToken).to.be.a("string");

    expect(sitter.resetPasswordToken).to.be.a("string");
    expect(sitter.resetPasswordExpire).to.be.a("number");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    expect(sitter.resetPasswordToken).to.equal(hashedToken);
  });

  it("should allow updating image field", async () => {
    const sitterData = {
      name: "Charlie Brown",
      email: "charlie@example.com",
      phone: "7778889999",
      address: "500 Pet St, City",
      password: "password123",
      image: "charlie.jpg",
    };

    const sitter = new PetSitter(sitterData);
    await sitter.save();

    expect(sitter.image).to.equal("charlie.jpg");

    sitter.image = "charlie_updated.jpg";
    await sitter.save();

    expect(sitter.image).to.equal("charlie_updated.jpg");
  });
});
