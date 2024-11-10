const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pseudo: {
        type: String,
        required: true,
        unique: true
    },
    grade: String,
    avatar: String, // URL de l'avatar
    enrolledCourses: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        enrollmentDate: {
            type: Date,
            default: Date.now
        },
        lastAccessed: Date
    }],
    progress: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        completedLessons: [{
            lessonId: String,
            completedAt: Date,
            timeSpent: Number // en minutes
        }],
        quizScores: [{
            quizId: String,
            score: Number,
            completedAt: Date
        }],
        overallProgress: {
            type: Number,
            default: 0 // pourcentage de progression
        }
    }],
    upcomingSessions: [{
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course.sessions'
        },
        date: Date,
        duration: Number,
        courseTitle: String,
        meetingLink: String,
        reminder: {
            enabled: {
                type: Boolean,
                default: true
            },
            sentAt: Date
        }
    }]
});

// Index pour la recherche rapide
studentSchema.index({ parentId: 1, pseudo: 1 });

module.exports = mongoose.model('Student', studentSchema); 