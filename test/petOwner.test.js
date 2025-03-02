require("dotenv").config({ path: "./config/config.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const chai = require("chai");
const expect = chai.expect;
const PetOwner = require("../model/PetOwner");

describe("PetOwner Model", () => {
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
    await PetOwner.deleteMany({});
  });

  it("should hash the password before saving", async () => {
    const ownerData = {
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "1234567890",
      address: "123 Street, City",
      password: "password123",
    };

    const owner = new PetOwner(ownerData);
    await owner.save();

    expect(owner.password).to.not.equal("password123");
    const isMatch = await bcrypt.compare("password123", owner.password);
    expect(isMatch).to.be.true;
  });

  it("should generate a valid JWT token", async () => {
    const ownerData = {
      name: "Jane Doe",
      email: "janedoe@example.com",
      phone: "9876543210",
      address: "456 Avenue, City",
      password: "password123",
    };

    const owner = new PetOwner(ownerData);
    await owner.save();

    const token = owner.getSignedJwtToken();
    expect(token).to.be.a("string");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).to.equal(owner._id.toString());
  });

  it("should correctly match passwords", async () => {
    const ownerData = {
      name: "Alice Smith",
      email: "alice@example.com",
      phone: "1112223333",
      address: "789 Boulevard, City",
      password: "password123",
    };

    const owner = new PetOwner(ownerData);
    await owner.save();

    const isMatch = await owner.matchPassword("password123");
    expect(isMatch).to.be.true;

    const isNotMatch = await owner.matchPassword("wrongpassword");
    expect(isNotMatch).to.be.false;
  });

  it("should generate and hash a reset password token", async () => {
    const ownerData = {
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "4445556666",
      address: "101 Pine St, City",
      password: "password123",
    };

    const owner = new PetOwner(ownerData);
    await owner.save();

    const resetToken = owner.getResetPasswordToken();
    expect(resetToken).to.be.a("string");

    expect(owner.resetPasswordToken).to.be.a("string");
    expect(owner.resetPasswordExpire).to.be.a("number");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    expect(owner.resetPasswordToken).to.equal(hashedToken);
  });

  it("should allow adding pets", async () => {
    const ownerData = {
      name: "Charlie Brown",
      email: "charlie@example.com",
      phone: "7778889999",
      address: "500 Pet St, City",
      password: "password123",
      pets: [
        {
          petname: "Buddy",
          type: "Dog",
          petimage: "buddy.jpg",
          petinfo: "Golden Retriever",
          openbooking: "yes",
          booked: "no",
        },
      ],
    };

    const owner = new PetOwner(ownerData);
    await owner.save();

    expect(owner.pets).to.be.an("array").with.lengthOf(1);
    expect(owner.pets[0].petname).to.equal("Buddy");
    expect(owner.pets[0].type).to.equal("Dog");
    expect(owner.pets[0].openbooking).to.equal("yes");
  });
});
