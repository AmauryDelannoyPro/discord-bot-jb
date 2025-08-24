const messageRepository = require("../repository/messageRepository")


const getUserMessages = async (req, res) => {
    try {
        const response = await messageRepository.getUserMessages(req.query.userId)
        if (!response) {
            throw new Error();
        }
        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting message:', error);
        res.status(500).json({ status: 'Internal server error' });
    }
};


const postEvaluation = async (req, res) => {
    try {
        const evaluationInfo = req.body;
        const response = await messageRepository.replyMessageOnDiscord(evaluationInfo.channelId, evaluationInfo.evaluation, evaluationInfo.messageId)
        if (!response) {
            res.status(400).json({ 
                id: evaluationInfo.messageId, // TODO Bon id ? On n'a pas l'ID du nouveau message posté, seulement celui a qui on répond
                content: 'Message is empty, please fill form.',
            });
        } else {
            res.status(200).json({ 
                id: evaluationInfo.messageId, // TODO Bon id ? On n'a pas l'ID du nouveau message posté, seulement celui a qui on répond
                content: response,
            })
        }
    } catch (error) {
        console.error('Error sending evaluation:', error);
        res.status(500).json({ status: 'Internal server error' });
    }
};


const ignoreMessage = async (req, res) => {
    try {
        const body = req.body;
        messageRepository.ignoreMessage(body.channelId, body.messageId)
        res.status(200).json({ 
            id: body.messageId, // TODO Bon id ? On n'a pas l'ID du nouveau message posté, seulement celui a qui on répond
            content: null,
        });
    } catch (error) {
        res.status(500).json({ status: 'Internal server error' });
    }
};


const getCriterias = async (req, res) => {
    try {
        const response = await messageRepository.getCriterias()
        if (!response) {
            throw new Error();
        }
        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting criterias:', error);
        res.status(500).json({ status: 'Internal server error' });
    }
}

module.exports = {
    getUserMessages,
    postEvaluation,
    ignoreMessage,
    getCriterias,
}