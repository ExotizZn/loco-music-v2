const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'stop',
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
        if(queue){
            queue.player.stop()
            queue.connection.destroy()
            queue.queue = []
            queue.playing = false

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('🟢 Déconnecté avec succès 🟢')
                
            return send({embeds : [embed]})
        }
    }
}