require("dotenv").config({ path: "./config/config.env" });
const mongoose = require("mongoose");
const chai = require("chai");
const expect = chai.expect;
const Booking = require("../model/Booking");
const PetOwner = require("../model/PetOwner");
const PetSitter = require("../model/PetSitter");
const { Types } = require("mongoose");

describe("Booking Model", () => {
  let owner, sitter, petOwnerData, petSitterData;

  before(async () => {
    console.log("TEST_DB_URI:", process.env.TEST_DB_URI);
    await mongoose.connect(process.env.TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test data for pet owner and pet sitter
    petOwnerData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Street, City",
      password: "password123",
    };

    petSitterData = {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "9876543210",
      address: "456 Avenue, City",
      password: "password123",
    };

    // Save pet owner and pet sitter
    owner = new PetOwner(petOwnerData);
    sitter = new PetSitter(petSitterData);
    await owner.save();
    await sitter.save();
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
  });

  it("should create a booking", async () => {
    const bookingData = {
      ownerId: owner._id,
      sitterId: sitter._id,
      petId: new Types.ObjectId(), // Assuming this is a valid pet object
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-05"),
      status: "pending",
    };

    const booking = new Booking(bookingData);
    await booking.save();

    expect(booking.ownerId.toString()).to.equal(owner._id.toString());
    expect(booking.sitterId.toString()).to.equal(sitter._id.toString());
    expect(booking.petId).to.be.a("object");
    expect(booking.startDate).to.be.a("date");
    expect(booking.endDate).to.be.a("date");
    expect(booking.status).to.equal("pending");
  });

  it("should set default status to 'pending'", async () => {
    const bookingData = {
      ownerId: owner._id,
      sitterId: sitter._id,
      petId: new Types.ObjectId(),
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-05"),
    };

    const booking = new Booking(bookingData);
    await booking.save();

    expect(booking.status).to.equal("pending");
  });

  it("should allow updating the status", async () => {
    const bookingData = {
      ownerId: owner._id,
      sitterId: sitter._id,
      petId: new Types.ObjectId(),
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-05"),
      status: "pending",
    };

    const booking = new Booking(bookingData);
    await booking.save();

    booking.status = "confirmed";
    await booking.save();

    expect(booking.status).to.equal("confirmed");
  });

  it("should throw an error if status is invalid", async () => {
    const bookingData = {
      ownerId: owner._id,
      sitterId: sitter._id,
      petId: new Types.ObjectId(),
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-05"),
      status: "invalidStatus",
    };

    try {
      const booking = new Booking(bookingData);
      await booking.save();
    } catch (error) {
      expect(error).to.exist;
      expect(error.errors.status).to.exist;
    }
  });

  it("should have a createdAt field", async () => {
    const bookingData = {
      ownerId: owner._id,
      sitterId: sitter._id,
      petId: new Types.ObjectId(),
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-05"),
    };

    const booking = new Booking(bookingData);
    await booking.save();

    expect(booking.createdAt).to.be.a("date");
  });

  it("should populate ownerId and sitterId fields", async () => {
    const bookingData = {
      ownerId: owner._id,
      sitterId: sitter._id,
      petId: new Types.ObjectId(),
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-05"),
    };

    const booking = new Booking(bookingData);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("ownerId")
      .populate("sitterId");

    expect(populatedBooking.ownerId.name).to.equal(owner.name);
    expect(populatedBooking.sitterId.name).to.equal(sitter.name);
  });
});
