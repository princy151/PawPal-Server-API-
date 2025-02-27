const asyncHandler = require("../middleware/async");
const path = require("path");
const fs = require("fs");
const PetOwner = require("../model/PetOwner");



// @desc    Create new user
// @route   POST /api/v1/petowner
// @access  Public

exports.register = asyncHandler(async (req, res, next) => {
  const petowner = await PetOwner.findOne({ email: req.body.email });
  console.log(req.body);
  if (petowner) {
    return res.status(400).send({ message: "User already exists" });
  }

  await PetOwner.create(req.body);

  res.status(200).json({
    success: true,
    message: "User created successfully",
  });
});

// @desc   Login user
// @route  POST /api/v1/users/login
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide a email and password" });
  }

  // Check if petwoner exists
  const petowner = await PetOwner.findOne({ email }).select("+password");

  if (!petowner || !(await petowner.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  sendTokenResponse(petowner, 200, res);
});


// @desc Upload Single Image
// @route POST /api/v1/auth/upload
// @access Private

exports.uploadImage = asyncHandler(async (req, res, next) => {
  // // check for the file size and send an error message
  // if (req.file.size > process.env.MAX_FILE_UPLOAD) {
  //   return res.status(400).send({
  //     message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
  //   });
  // }

  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// Get token from model , create cookie and send response
const sendTokenResponse = (PetOwner, statusCode, res) => {
  const token = PetOwner.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      userId: PetOwner._id,  // Add the user ID here
    });
};



// @desc    Get all Owners
// @route   GET /api/v1/owners
// @access  Public

exports.getOwners = async (req, res, next) => {
  try {
    const owners = await PetOwner.find();

    res.status(200).json({
      success: true,
      count: owners.length,
      data: owners,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single owner
// @route   GET /api/v1/owners/:id
// @access  Public

exports.getOwner = async (req, res, next) => {
  try {
    const owner = await PetOwner.findById(req.params.id);

    if (!owner) {
      return res.status(401).json({ message: "cannot find the owner with " });
    }

    res.status(200).json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
};

exports.addPet = asyncHandler(async (req, res, next) => {
  const { petname, type, petimage, petinfo } = req.body;
  const owner = await PetOwner.findById(req.params.id);

  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  const newPet = {
    petname,
    type,
    petimage,
    petinfo,
  };

  owner.pets.push(newPet);
  await owner.save();

  res.status(200).json({
    success: true,
    data: owner.pets,
  });
});

exports.updatePet = asyncHandler(async (req, res, next) => {
  const { petname, type, petimage, petinfo } = req.body;
  const owner = await PetOwner.findById(req.params.id);

  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  const pet = owner.pets.id(req.params.petId);

  if (!pet) {
    return res.status(404).json({ message: "Pet not found" });
  }

  pet.petname = petname || pet.petname;
  pet.type = type || pet.type;
  pet.petimage = petimage || pet.petimage;
  pet.petinfo = petinfo || pet.petinfo;

  await owner.save();

  res.status(200).json({
    success: true,
    data: pet,
  });
});

// @desc    Delete a pet
// @route   DELETE /api/v1/owners/:id/pets/:petId
// @access  Private

exports.deletePet = asyncHandler(async (req, res, next) => {
  const owner = await PetOwner.findById(req.params.id);

  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  const pet = owner.pets.id(req.params.petId);

  if (!pet) {
    return res.status(404).json({ message: "Pet not found" });
  }

  // Remove the pet from the owner's pets array
  owner.pets.pull(req.params.petId);

  await owner.save();

  res.status(200).json({
    success: true,
    message: "Pet deleted successfully",
    data: owner.pets,
  });
});

// @desc    Toggle openBooking status for a pet
// @route   PATCH /api/v1/owners/:id/pets/:petId/toggleOpenBooking
// @access  Private

exports.toggleOpenBooking = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;
  
  // Find the owner
  const owner = await PetOwner.findById(req.params.id);

  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  // Find the pet within the owner's pets array
  const pet = owner.pets.id(petId);

  if (!pet) {
    return res.status(404).json({ message: "Pet not found" });
  }

  // Toggle the openBooking status for the pet
  pet.openbooking = pet.openbooking === 'no' ? 'yes' : 'no'; // Toggle the value

  // Save the updated owner document
  await owner.save();

  res.status(200).json({
    success: true,
    message: `Pet's openBooking status updated to ${pet.openbooking}`,
    data: pet,
  });
});
