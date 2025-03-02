const express = require("express");
const router = express.Router();
const bookingController = require("../controller/BookingController");

router.post("/create", bookingController.createBooking);
router.get("/", bookingController.getAllBookings);
router.get("/sitter/:sitterId", bookingController.getBookingsBySitter);
router.get("/owner/:ownerId", bookingController.getBookingsByOwner);
router.get("/:id", bookingController.getBookingById);
router.patch("/update/:id", bookingController.updateBookingStatus);
router.delete("/:id", bookingController.deleteBooking);
router.put("/:id/dates", bookingController.updateBookingDates);
router.put("dates/:id", bookingController.updateBookingDates);


module.exports = router;
