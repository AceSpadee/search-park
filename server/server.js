// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// fix this later =================================================================

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// In-memory array to store the locations
let locations = [];

// Endpoint to receive location data from the client
app.post('/api/locations', (req, res) => {
  const { lat, lon } = req.body;
  if (lat && lon) {
    locations.push({ lat, lon, timestamp: new Date() });
    console.log('Location received:', { lat, lon });
    res.status(201).send('Location saved');
  } else {
    res.status(400).send('Invalid data');
  }
});

// Endpoint to get all tracked locations (optional)
app.get('/api/locations', (req, res) => {
  res.json(locations);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});