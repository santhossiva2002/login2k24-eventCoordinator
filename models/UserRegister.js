const mongoose = require('mongoose');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
    studentName: { type: String},
    rollNumber: { type: String},
    collegeName: { type: String},
    collegeCode: { type: String},
    degree: { type: String},
    stream: { type: String},
    email: { type: String},
    otp: { type: String},
    contactNumber: { type: String},
    password: { type: String},
    yearOfStudy: { type: String},
    gender: { type: String},
    foodPreference: { type: String},
    accommodation: { type: String},
    eventids: { type: [String]}
});

// Create a model based on the schema
const User = mongoose.model('UserRegistration', userSchema);

module.exports = User;
