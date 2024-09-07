const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    pwd: { type: String, required: true },
    event: { type: String, required: true }
});

const Event = mongoose.model('coordinators', eventSchema);

module.exports = Event;
