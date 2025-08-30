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
        let response = null;
        if (evaluationInfo.action == "submit"){
            response = await messageRepository.replyMessageOnDiscord(evaluationInfo.channelId, evaluationInfo.evaluation, evaluationInfo.messageId)
        }
        else if (evaluationInfo.action == "ignore"){
            response = await messageRepository.ignoreMessage(evaluationInfo.channelId, evaluationInfo.messageId)
        }
        
        if (!response) {
            res.status(400).json({ 
                id: evaluationInfo.messageId,
                content: 'Message is empty, please fill form.',
            });
        } else {
            res.status(200).json({ 
                id: evaluationInfo.messageId,
                content: response,
            })
        }
    } catch (error) {
        console.error('Error sending evaluation:', error);
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
    getCriterias,
}