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
  updateSitter,
} = require("../controller/PetSitterController");

router.post("/uploadImage", upload, uploadImage);
router.post("/register", register);
router.post("/login", login);
router.get("/getAllSitters", getSitters);
router.get("/:id", getSitter);
router.put("update/:id", updateSitter);

module.exports = router;