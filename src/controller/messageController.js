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
        console.log("envoi evaluation start")
        const evaluationInfo = req.body;
        const response = await messageRepository.replyMessageOnDiscord(evaluationInfo.channelId, evaluationInfo.evaluationForm, evaluationInfo.messageId)
        if (!response) {
            res.status(400).json({ messageResponse: 'Message is empty, please fill form.' });
        } else {
            res.status(200).json({ messageResponse: response })
        }
    } catch (error) {
        console.error('Error sending evaluation:', error);
        res.status(500).json({ status: 'Internal server error' });
    }
};


module.exports = {
    getUserMessages,
    postEvaluation
}