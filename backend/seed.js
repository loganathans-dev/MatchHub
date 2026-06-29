const mongoose = require('mongoose');
const dotenv = require('dotenv');
const College = require('./models/College');
const Event = require('./models/Event');
const Department = require('./models/Department');
const Match = require('./models/Match');
const Admin = require('./models/Admin');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  await connectDB();

  try {
    // Clear all existing data
    await Admin.deleteMany();
    await Match.deleteMany();
    await Department.deleteMany();
    await Event.deleteMany();
    await College.deleteMany();

    // 0. Create an Admin
    await Admin.create({
      email: 'admin@system.local',
      password: 'admin123',
    });

    // 1. Create Colleges
    const collegesToCreate = [
      {
        collegeName: 'Global Institute of Technology',
        collegeCode: 'GIT001',
        collegeType: 'Engineering',
        email: 'management@college.edu',
        mobileNumber: '9876543210',
        password: 'password123',
        address: '123 Tech Campus Road',
        city: 'Techville',
        district: 'Innovation',
        state: 'State',
        pincode: '123456',
        coordinatorName: 'Dr. John Smith',
        coordinatorMobile: '9998887776',
        coordinatorEmail: 'john.smith@college.edu',
      },
      {
        collegeName: 'National Arts & Science College',
        collegeCode: 'NASC002',
        collegeType: 'Arts and Science',
        email: 'admin@nasc.edu',
        mobileNumber: '9123456780',
        password: 'password123',
        address: '45 Heritage Ave',
        city: 'Metropolis',
        district: 'Central',
        state: 'State',
        pincode: '654321',
        coordinatorName: 'Prof. Mary Jane',
        coordinatorMobile: '8887776665',
        coordinatorEmail: 'mary.jane@nasc.edu',
      },
      {
        collegeName: 'Elite Medical College',
        collegeCode: 'EMC003',
        collegeType: 'Medical',
        email: 'admin@emc.edu',
        mobileNumber: '9001112223',
        password: 'password123',
        address: '77 Health Blvd',
        city: 'Care City',
        district: 'Medical',
        state: 'State',
        pincode: '112233',
        coordinatorName: 'Dr. House',
        coordinatorMobile: '7778889990',
        coordinatorEmail: 'dr.house@emc.edu',
      }
    ];

    const createdColleges = await College.insertMany(collegesToCreate);
    const primaryCollege = createdColleges[0];

    // 2. Create an Event
    const createdEvent = await Event.create({
      title: 'Annual Sports Meet 2026',
      startDate: new Date('2026-06-25'),
      endDate: new Date('2026-06-30'),
      description: 'The biggest sporting event of the year!',
      college: primaryCollege._id,
      sportsList: ['Football', 'Basketball', '100m', 'Chess'],
      status: 'Upcoming',
    });

    // 3. Create Departments (Teams)
    const departments = [
      { name: 'CSE Strikers (Computer Science)', college: primaryCollege._id, teamCaptain: 'Alice', captainMobile: '1112223334' },
      { name: 'MECH Titans (Mechanical)', college: primaryCollege._id, teamCaptain: 'Bob', captainMobile: '1112223335' },
      { name: 'EEE Sparks (Electrical)', college: primaryCollege._id, teamCaptain: 'Charlie', captainMobile: '1112223336' },
      { name: 'IT Eagles (Information Tech)', college: primaryCollege._id, teamCaptain: 'David', captainMobile: '1112223337' },
      { name: 'CIVIL Builders (Civil)', college: primaryCollege._id, teamCaptain: 'Eve', captainMobile: '1112223338' },
      { name: 'ECE Wave (Electronics)', college: primaryCollege._id, teamCaptain: 'Frank', captainMobile: '1112223339' },
      { name: 'MBA Leaders (Business)', college: primaryCollege._id, teamCaptain: 'Grace', captainMobile: '1112223340' },
    ];
    
    const createdDepartments = await Department.insertMany(departments);

    const getDept = (namePart) => createdDepartments.find(d => d.name.includes(namePart))._id;

    // 4. Create Matches
    const matches = [
      {
        event: createdEvent._id,
        sportName: 'Football',
        type: 'team',
        dateTime: new Date('2026-06-25T10:00:00'),
        teamA: getDept('CSE'),
        teamB: getDept('MECH'),
        status: 'Scheduled'
      },
      {
        event: createdEvent._id,
        sportName: 'Basketball',
        type: 'team',
        dateTime: new Date('2026-06-25T14:30:00'),
        teamA: getDept('EEE'),
        teamB: getDept('IT'),
        status: 'Scheduled'
      },
      {
        event: createdEvent._id,
        sportName: '100m',
        type: 'athletics',
        dateTime: new Date('2026-06-26T09:00:00'),
        participants: [getDept('CSE'), getDept('MECH'), getDept('EEE'), getDept('IT'), getDept('CIVIL')],
        status: 'Scheduled'
      },
      {
        event: createdEvent._id,
        sportName: 'Chess',
        type: 'individual',
        dateTime: new Date('2026-06-26T11:00:00'),
        participants: [getDept('CSE'), getDept('ECE'), getDept('MBA')],
        status: 'Completed',
        winner: getDept('CSE'),
        score: 'Checkmate'
      }
    ];

    await Match.insertMany(matches);

    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();
