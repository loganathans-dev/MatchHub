require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const clearEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    // Wipe all events
    await Event.deleteMany({});
    console.log('Successfully DELETED all mock events from the database.');

    process.exit(0);
  } catch (error) {
    console.error('Error clearing events:', error);
    process.exit(1);
  }
};

clearEvents();
