const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');

// Créer un compte étudiant (accessible aux parents)
router.post('/students', auth, checkRole(['parent']), async (req, res) => {
    try {
        const studentUser = new User({
            email: req.body.email,
            web3authId: req.body.web3authId,
            role: 'student',
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });
        await studentUser.save();

        const student = new Student({
            userId: studentUser._id,
            parentId: req.user._id,
            grade: req.body.grade
        });
        await student.save();

        res.status(201).send({ studentUser, student });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router; 