const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const connectDB = require('./config/dbConn'); //file contains the MongoDB connection logic
const app = express();

// Load environment variables from .env file if available
require('dotenv').config();

// Call the function to connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000; // Define PORT or use a default value

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls: shortUrls });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/shortUrls', async (req, res) => {
  try {
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    await shortUrl.save();

    res.redirect(shortUrl.full);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Listen to MongoDB connection event
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Listen to MongoDB error event
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

