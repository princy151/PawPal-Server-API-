const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const upload = require("../middleware/uploads");

const {
  register,
  login,
  uploadImage,
  getOwners,
  getOwner,
  addPet,
  updatePet,
  deletePet,
  toggleOpenBooking
} = require("../controller/PetOwnerController");

router.post("/uploadImage", upload, uploadImage);
router.post("/register", register);
router.post("/login", login);
router.get("/getAllOwners", getOwners);
router.get("/:id", getOwner);
router.patch("/:id/addPet", addPet);
router.patch("/:id/updatePet/:petId", updatePet);
router.delete("/:id/pets/:petId",deletePet);
router.patch("/:id/pets/:petId/toggleOpenBooking", toggleOpenBooking);





module.exports = router;