const redis = require("../service/redis")


const getUsersByRecentMessages = async (recentFirst) => {
    return redis.getUsersByRecentMessages(recentFirst)
}


module.exports = {
    getUsersByRecentMessages,
};