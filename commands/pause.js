const { MessageEmbed } = require("discord.js");


module.exports = {
    name: 'pause',
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

        if (queue.playing){
            queue.player.pause()
            queue.playing = false

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('ð¢ Pause ð¢')

            return send({embeds:[embed]})

        } else {
            const embed  = new MessageEmbed()
                .setColor("RED")
                .setTitle("ð´ DÃ©jÃ  sur pause ð´")

            return error({embeds: [embed]})
        }

        
    }
}