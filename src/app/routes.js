const express = require('express')
const router = express.Router();
const userController = require("../controller/userController")
const messageController = require("../controller/messageController")

// Route pour récupérer la liste des utilisateurs
router.get('/get-users', userController.getUsers);

// Route pour récupérer la liste des messages d'un utilisateur
router.get('/get-user-messages', messageController.getUserMessages);

// Route pour récupérer les critères d'évaluations
router.get('/get-evaluation-criterias', messageController.getCriterias)

// Route pour poster l'évaluation
router.post('/send-message', messageController.postEvaluation);

// Route pour récupérer tous les messages en attente d'évaluation
router.get('/get-messages', messageController.getMessages)

module.exports = router;