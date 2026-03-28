require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.BASE_ID;
const PORT = process.env.PORT || 5001;

const EVENTS_TABLE = "Events";
const BOOKINGS_TABLE = "Bookings";

if (!AIRTABLE_TOKEN || !BASE_ID) {
  console.error("Missing AIRTABLE_TOKEN or BASE_ID in .env file.");
  process.exit(1);
}

const airtableHeaders = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json"
};

app.get("/", (req, res) => {
  res.send("EventFlow backend is running.");
});

app.get("/events", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${BASE_ID}/${EVENTS_TABLE}`,
      { headers: airtableHeaders }
    );

    res.json(response.data.records);
  } catch (error) {
    console.error(
      "Error fetching events:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Error fetching events" });
  }
});

app.post("/bookings", async (req, res) => {
  const { name, email, event } = req.body;

  if (!name || !email || !event) {
    return res.status(400).json({
      message: "Name, email, and event are required."
    });
  }

  try {
    const response = await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/${BOOKINGS_TABLE}`,
      {
        records: [
          {
            fields: {
              name,
              email,
              event
            }
          }
        ]
      },
      { headers: airtableHeaders }
    );

    res.status(201).json({
      message: "Booking created successfully.",
      data: response.data
    });
  } catch (error) {
    console.error(
      "Error creating booking:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Error creating booking" });
  }
});

app.listen(PORT, () => {
  console.log(`EventFlow server running on http://localhost:${PORT}`);
});