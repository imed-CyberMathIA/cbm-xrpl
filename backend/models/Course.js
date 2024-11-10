const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    level: String,
    subject: {
        type: String,
        enum: ['mathematics', 'informatics'],
        required: true
    },
    materials: [{
        type: {
            type: String,
            enum: ['pdf', 'video', 'live'],
            required: true
        },
        title: String,
        content: String, // URL ou contenu
        duration: Number // en minutes pour les vidéos/live
    }],
    sessions: [{
        date: Date,
        duration: Number,
        meetingLink: String,
        maxStudents: Number,
        enrolledStudents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }]
    }]
});

module.exports = mongoose.model('Course', courseSchema); 