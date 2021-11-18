const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'ping',
    voiceChannel: true,

    async execute( client, message, args ) {
        message.channel.send(`${Date.now() - message.createdTimestamp}ms`)
    }
}