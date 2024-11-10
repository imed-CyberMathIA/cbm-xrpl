const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');

router.post('/verify-web3auth', async (req, res) => {
    try {
        const { idToken, email, web3authId } = req.body;
        
        // Vérifier le token Web3Auth ici
        
        let user = await User.findOne({ email });
        
        if (!user) {
            // Nouvel utilisateur
            user = new User({
                email,
                web3authId,
                role: 'parent' // rôle par défaut
            });
            await user.save();
        }

        const token = jwt.sign({ web3authId: user.web3authId }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/set-role', auth, async (req, res) => {
    try {
        const { role } = req.body;
        const allowedRoles = ['student', 'parent', 'teacher'];
        
        if (!allowedRoles.includes(role)) {
            return res.status(400).send({ error: 'Rôle invalide' });
        }

        // Mettre à jour le rôle de l'utilisateur
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { role },
            { new: true }
        );

        res.send({ user });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/student-login', async (req, res) => {
    try {
        const { pseudo, password } = req.body;
        
        const student = await Student.findOne({ pseudo })
            .populate('userId');
            
        if (!student) {
            return res.status(401).send({ message: 'Pseudo ou mot de passe incorrect' });
        }
        
        // Vérifier le mot de passe (utiliser bcrypt dans la vraie implémentation)
        const isMatch = await bcrypt.compare(password, student.userId.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Pseudo ou mot de passe incorrect' });
        }
        
        const token = jwt.sign(
            { userId: student.userId._id, studentId: student._id },
            process.env.JWT_SECRET
        );
        
        res.send({
            token,
            studentId: student._id,
            role: 'student'
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router; 