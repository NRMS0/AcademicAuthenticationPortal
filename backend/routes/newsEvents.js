const express = require("express");
const router = express.Router();
const NewsEvent = require("../models/NewsEvent");
const { verifyToken, isLecturer } = require("../middleware/authMiddleware");

// Create a news/event (Lecturers only)
router.post("/", verifyToken, isLecturer, async (req, res) => {
  try {
    const { title, description, type, startDate, endDate } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ message: "Title, description, and type are required" });
    }

    if (!["news", "event"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'news' or 'event'" });
    }

    if (type === "event") {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required for events" });
      }
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ message: "End date must be after start date" });
      }
    }

    // Create and save the news/event
    const newsEvent = new NewsEvent({ title, description, type, startDate, endDate });
    await newsEvent.save();

    res.status(201).json(newsEvent);
  } catch (error) {
    console.error("Error creating news/event:", error);
    res.status(500).json({ message: "Error creating news/event", error: error.message });
  }
});

// Get all news/events Students, Lecturers & Public
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {}; 
    const newsEvents = await NewsEvent.find(filter).sort({ date: -1 }); 
    res.status(200).json(newsEvents);
  } catch (error) {
    console.error("Error fetching news/events:", error);
    res.status(500).json({ message: "Error fetching news/events", error: error.message });
  }
});

// Update a news/event (Lecturers only)
router.put("/:id", verifyToken, isLecturer, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, startDate, endDate } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ message: "Title, description, and type are required" });
    }

    if (!["news", "event"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'news' or 'event'" });
    }

    if (type === "event") {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required for events" });
      }
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ message: "End date must be after start date" });
      }
    }

    // Find and update the news/event
    const updatedNewsEvent = await NewsEvent.findByIdAndUpdate(
      id,
      { title, description, type, startDate, endDate },
      { new: true } 
    );

    if (!updatedNewsEvent) {
      return res.status(404).json({ message: "News/Event not found" });
    }

    res.status(200).json(updatedNewsEvent);
  } catch (error) {
    console.error("Error updating news/event:", error);
    res.status(500).json({ message: "Error updating news/event", error: error.message });
  }
});

// Delete a news/event (Lecturers only)
router.delete("/:id", verifyToken, isLecturer, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNewsEvent = await NewsEvent.findByIdAndDelete(id);

    if (!deletedNewsEvent) {
      return res.status(404).json({ message: "News/Event not found" });
    }

    res.status(200).json({ message: "News/Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting news/event:", error);
    res.status(500).json({ message: "Error deleting news/event", error: error.message });
  }
});

module.exports = router;