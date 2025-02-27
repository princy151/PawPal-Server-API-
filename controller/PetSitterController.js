const asyncHandler = require("../middleware/async");
const path = require("path");
const fs = require("fs");
const PetSitter = require("../model/PetSitter");




// @desc    Create new user
// @route   POST /api/v1/petsitter
// @access  Public

exports.register = asyncHandler(async (req, res, next) => {
  const petsitter = await PetSitter.findOne({ email: req.body.email });
  console.log(req.body);
  if (petsitter) {
    return res.status(400).send({ message: "User already exists" });
  }

  await PetSitter.create(req.body);

  res.status(200).json({
    success: true,
    message: "User created successfully",
  });
});

// @desc   Login user
// @route  POST /api/v1/sitter/login
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide a email and password" });
  }

  // Check if petwoner exists
  const petsitter = await PetSitter.findOne({ email }).select("+password");

  if (!petsitter || !(await petsitter.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  sendTokenResponse(petsitter, 200, res);
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
const sendTokenResponse = (PetSitter, statusCode, res) => {
  const token = PetSitter.getSignedJwtToken();

  const options = {
    //Cookie will expire in 30 days
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Cookie security is false .if you want https then use this code. do not use in development time
  if (process.env.NODE_ENV === "proc") {
    options.secure = true;
  }
  //we have created a cookie with a token

  res
    .status(statusCode)
    .cookie("token", token, options) // key , value ,options
    .json({
      success: true,
      token,
      sitterId: PetSitter._id, 
    });
};

// @desc    Get all Sitters
// @route   GET /api/v1/sitter
// @access  Public

exports.getSitters = async (req, res, next) => {
  try {
    const sitters = await PetSitter.find();

    res.status(200).json({
      success: true,
      count: sitters.length,
      data: sitters,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single owner
// @route   GET /api/v1/owners/:id
// @access  Public

exports.getSitter = async (req, res, next) => {
  try {
    const sitter = await PetSitter.findById(req.params.id);

    if (!sitter) {
      return res.status(401).json({ message: "cannot find the sitter with " });
    }

    res.status(200).json({ success: true, data: sitter });
  } catch (err) {
    next(err);
  }
};


