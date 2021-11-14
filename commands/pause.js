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
                .setTitle("🔴 Pas de musique 🔴")

            return error({embeds : [embed]})
        } 

        if (queue.playing){
            queue.player.pause()
            queue.playing = false

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('🟢 Pause 🟢')

            return send({embeds:[embed]})

        } else {
            const embed  = new MessageEmbed()
                .setColor("RED")
                .setTitle("🔴 Déjà sur pause 🔴")

            return error({embeds: [embed]})
        }

        
    }
}