const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'resume',
    aliases: ['r'],
    voiceChannel: true,

    async execute( client, message ) {
        const queue = message.client.queue.get(message.guild.id);

        const error = (err) => message.channel.send(err);
        const send = (content) => message.channel.send(content);

        if(!queue){
            const embed  = new MessageEmbed()
                .setColor("RED")
                .setTitle("ð´ Pas de musique ð´")

            return error({embeds : [embed]})
        } 

        if(queue.playing){
            const embed  = new MessageEmbed()
            .setColor("RED")
            .setTitle("ð´ DÃ©jÃ  sur play ð´")

            return error({embeds:[embed]})
        } else {
            const embed  = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("ð¢ Play ð¢")

            queue.player.unpause()
            queue.playing = true
            return send({embeds:[embed]})
        }

    }
}