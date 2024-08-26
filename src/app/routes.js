const express = require('express')
const router = express.Router();
const userController = require("../controller/userController")
const messageController = require("../controller/messageController")

// Route pour récupérer la liste des utilisateurs
router.get('/get-users', userController.getUsers);

// Route pour récupérer la liste des messages d'un utilisateur
router.get('/get-user-messages', messageController.getUserMessages);

// Route pour poster l'évaluation
router.post('/send-message', messageController.postEvaluation);

// Route pour poster l'évaluation
router.post('/ignore-message', messageController.ignoreMessage);

module.exports = router;