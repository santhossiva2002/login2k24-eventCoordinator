const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
    studentName: { type: String },
    rollNumber: { type: String },
    collegeName: { type: String },
    degree: { type: String },
    stream: { type: String },
    email: { type: String },
    otp: { type: String },
    contactNumber: { type: String },
    password: { type: String },
    yearOfStudy: { type: String },
    gender: { type: String },
    foodPreference: { type: String },
    accommodation: { type: String },
    eventids: { type: [String] }
});

const Accommodation = mongoose.model('Accommodation', accommodationSchema);

module.exports = Accommodation;
