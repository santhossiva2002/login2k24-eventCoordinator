const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
    alumnusName: {
        type: String,
        required: true,
        trim: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    alumnusCode: {
        type: String,
        required: true,
  
        trim: true
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    otp: {
        type: String,
        required: true,
        trim: true
    },
    stream: {
        type: String,
        required: true,
        enum: ['Computer_Application', 'Data_Science', 'Theoretical_Computer_Science', 'Software_Systems', 'Software_Engineering']
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, 'Please fill a valid contact number']
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    foodPreference: {
        type: String,
        required: true,
        enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Other']
    },
    accommodationRequired: {
        type: Boolean,
        required: true,
        default: false
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const Signup = mongoose.model('AluminSignup', signupSchema);

module.exports = Signup;
