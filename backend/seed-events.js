require('dotenv').config();
const mongoose = require('mongoose');
const College = require('./models/College');
const Event = require('./models/Event');

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    const colleges = await College.find();
    if (colleges.length === 0) {
      console.log('No colleges found in the database. Please register a college first on the frontend!');
      process.exit(1);
    }

    console.log(`Found ${colleges.length} colleges. Seeding mock events for ALL of them...`);

    // Clear existing events to prevent duplicates
    await Event.deleteMany({});
    console.log('Cleared all existing events.');

    let allMockEvents = [];

    for (let college of colleges) {
      const mockEvents = [
        {
          title: 'Annual Sports Meet 2026',
          startDate: new Date('2026-08-15'),
          endDate: new Date('2026-08-20'),
          description: 'The biggest annual sports event featuring multiple track and field events.',
          sportsList: ['100m Sprint', 'Long Jump', 'Football'],
          status: 'Upcoming',
          college: college._id
        },
        {
          title: 'Inter-Department Cricket Tournament',
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-07-05'),
          description: 'T20 Cricket tournament between all departments.',
          sportsList: ['Cricket'],
          status: 'Ongoing',
          college: college._id
        },
        {
          title: 'Summer Volleyball Championship',
          startDate: new Date('2026-05-10'),
          endDate: new Date('2026-05-12'),
          description: 'Volleyball championship for men and women.',
          sportsList: ['Volleyball'],
          status: 'Completed',
          college: college._id
        }
      ];
      allMockEvents.push(...mockEvents);
    }

    await Event.insertMany(allMockEvents);
    console.log(`Successfully seeded ${allMockEvents.length} mock events across ${colleges.length} colleges!`);

    console.log('\n--- ALL SET ---');
    console.log('You can now see events on the EventList page no matter which account you are logged in with!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
