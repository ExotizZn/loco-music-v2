const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'queue',
    voiceChannel: true,

    async execute( client, message, args ) {
        const queue = message.client.queue.get(message.guild.id);

        const error = (err) => message.channel.send(err);
        const send = (content) => message.channel.send(content);
        
        if(!queue){
            const embed  = new MessageEmbed()
                .setColor("RED")
                .setTitle("🔴 Pas de musique 🔴")

            return error({embeds : [embed]})
        }  

        function embedCreator(queue){
            const length = queue.queue.length
            var list = " "
            for (let i = 0; i < length; i++) {
                if ((i) == 0){
                    const track = queue.queue[i]
                    list = list + `${i+1}. ${track.title} | (en cours de lecture...)\n`
                } else {
                    const track = queue.queue[i]
                    list = list + `${i+1}. ${track.title}\n`
                }
            }
            return list
        }

        if(args == 'clear'){
            queue.queue = []

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle("🟢 File d'attente effacée avec succès 🟢")

            return send({embeds:[embed]})
        }

        if(queue || (!args)){
            if(queue.queue.length == 0){
                const embed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle("Pas de musique en file d'attente")

                return error({embeds:[embed]})
            } else if (queue.queue.length > 0){
                const embed = new MessageEmbed()
                    .setColor("ORANGE")
                    .setTitle("File d'attente")
                    .setDescription(`${embedCreator(queue)}`)

                return send({embeds:[embed]})
            }
        }
    }
}
