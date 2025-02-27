const Booking = require("../model/Booking");
const PetOwner = require("../model/PetOwner");
const PetSitter = require("../model/PetSitter");

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { ownerId, sitterId, petId, startDate, endDate } = req.body;

        // Validate required fields
        if (!ownerId || !sitterId || !petId || !startDate || !endDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if owner and sitter exist
        const owner = await PetOwner.findById(ownerId);
        const sitter = await PetSitter.findById(sitterId);
        if (!owner || !sitter) {
            return res.status(404).json({ message: "Owner or Sitter not found." });
        }

        // Create booking
        const booking = new Booking({
            ownerId,
            sitterId,
            petId,
            startDate,
            endDate
        });

        await booking.save();
        res.status(201).json({ message: "Booking created successfully.", booking });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate("ownerId sitterId petId");
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate("ownerId sitterId petId");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Check if status is valid
        const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking status updated", booking });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all bookings for a specific sitter
// @route   GET /api/v1/bookings/sitter/:sitterId
// @access  Private
exports.getBookingsBySitter = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ sitterId: req.params.sitterId });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'No bookings found for this sitter' });
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update booking dates
exports.updateBookingDates = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Validate required fields
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Both startDate and endDate are required." });
        }

        // Find and update the booking
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { startDate, endDate },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking dates updated successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all bookings for a specific owner
// @route   GET /api/v1/bookings/owner/:ownerId
// @access  Private
exports.getBookingsByOwner = async (req, res) => {
    try {
        const bookings = await Booking.find({ ownerId: req.params.ownerId });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'No bookings found for this owner' });
        }

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
