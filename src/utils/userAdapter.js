const fromDiscordToRedisUser = (userDiscord) => {
    return {
        id: userDiscord.user.id,
        name: userDiscord.user.globalName,
        avatar: userDiscord.user.displayAvatarURL()
    }
}


module.exports = {
    fromDiscordToRedisUser
}