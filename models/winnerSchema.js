const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
    eventName: String,
    winnerTeamId: String,
    winnerParticipants: [String],
    runnerUpTeamId: String,
    runnerUpParticipants: [String]
});

const Winner = mongoose.model('Winner', winnerSchema);

module.exports = Winner;
