const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    web3authId: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['parent', 'student', 'teacher'],
        required: true
    },
    firstName: String,
    lastName: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema); 