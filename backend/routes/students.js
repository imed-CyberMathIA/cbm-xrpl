const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');

// Créer un nouveau profil élève
router.post('/', auth, checkRole(['parent']), async (req, res) => {
    try {
        // Vérifier si le pseudo est déjà utilisé
        const existingStudent = await Student.findOne({ pseudo: req.body.pseudo });
        if (existingStudent) {
            return res.status(400).send({ error: 'Ce pseudo est déjà utilisé' });
        }

        // Créer un compte utilisateur pour l'élève
        const studentUser = new User({
            email: `${req.body.pseudo}@student.cybermathia.com`, // email généré
            web3authId: `student_${req.body.pseudo}`, // ID généré
            role: 'student',
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });
        await studentUser.save();

        // Créer le profil élève
        const student = new Student({
            userId: studentUser._id,
            parentId: req.user._id,
            pseudo: req.body.pseudo,
            grade: req.body.grade,
            avatar: req.body.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${req.body.pseudo}` // Avatar par défaut
        });
        await student.save();

        res.status(201).send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Obtenir tous les élèves d'un parent
router.get('/my-students', auth, checkRole(['parent']), async (req, res) => {
    try {
        const students = await Student.find({ parentId: req.user._id })
            .populate('enrolledCourses.courseId')
            .populate('upcomingSessions.sessionId');
        res.send(students);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Obtenir un élève spécifique
router.get('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            $or: [
                { parentId: req.user._id }, // Parent de l'élève
                { 'enrolledCourses.courseId': { $in: req.user.teachingCourses } } // Professeur de l'élève
            ]
        }).populate('enrolledCourses.courseId');

        if (!student) {
            return res.status(404).send();
        }
        res.send(student);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Mettre à jour le profil d'un élève
router.patch('/:id', auth, checkRole(['parent']), async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['pseudo', 'grade', 'avatar'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Mises à jour invalides' });
    }

    try {
        const student = await Student.findOne({
            _id: req.params.id,
            parentId: req.user._id
        });

        if (!student) {
            return res.status(404).send();
        }

        updates.forEach(update => student[update] = req.body[update]);
        await student.save();

        res.send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router; 