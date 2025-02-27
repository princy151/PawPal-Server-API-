const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const upload = require("../middleware/uploads");

const {
  register,
  login,
  uploadImage,
  getSitter,
  getSitters,
} = require("../controller/PetSitterController");

router.post("/uploadImage", upload, uploadImage);
router.post("/register", register);
router.post("/login", login);
router.get("/getAllSitters", getSitters);
router.get("/:id", getSitter);

module.exports = router;