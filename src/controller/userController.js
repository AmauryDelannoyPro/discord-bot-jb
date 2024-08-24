const userRepository = require("../repository/userRepository")


const getUsers = async (req, res) => {
    try {
        const response = await userRepository.getUsersByRecentMessages(true) // prévoir option pour inverser l'ordre
        if (!response) {
            throw new Error();
        }
        res.status(200).json(response);

    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ status: 'Internal server error' });
    }
};


module.exports = {
    getUsers
}