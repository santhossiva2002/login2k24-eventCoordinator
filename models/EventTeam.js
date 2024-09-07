// models/EventTeam.js
const mongoose = require('mongoose');

const EventTeamSchema = new mongoose.Schema({
    teamId: { type: String, required: true, unique: true },
    studentName: { type: [String], required: true },
    emails: { type: [String], required: true }
});

module.exports = EventTeamSchema;
