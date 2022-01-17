const { createAudioResource } = require( '@discordjs/voice' );
const { MessageEmbed } = require('discord.js');
const ytdl = require( 'ytdl-core' );

module.exports = {
    name: 'skip',
    aliases:['s'],
    voiceChannel: true,

    async execute( client, message , args) {
        const channel = message.member.voice.channel;
        const queue = message.client.queue.get(message.guild.id);
        
        if ((!channel & !queue) || (!channel & Boolean(queue))){
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Erreur")
                .setDescription("Tu n'es pas connecté à un salon vocal")

            return send({embeds:[embed]})
        }

        if(queue & Boolean(channel)){
            const Queue = message.client.queue.get(message.guild.id);

            if (Queue.queue.length == 1){
                const embed = new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Erreur")
                    .setDescription("Pas de musique dans la file d'attente")

                return send({embeds:[embed]})
            }
             
            if (Queue.queue.length > 1){
                Queue.queue.shift()
                const reQueue = message.client.queue.get(message.guild.id);
                play(reQueue[0])
            }
        }

        function play(info){
            const Queue = message.client.queue.get(message.guild.id);
            const source = ytdl(info.url, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            })

            const resource = createAudioResource(source,{ inlineVolume: true });
            resource.volume.setVolume(1)
            const player = createAudioPlayer();

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            connection.subscribe(player);
            player.play(resource);

            Queue.player = player
            Queue.connection = connection

            player.on("idle", () => {
                Queue.queue.shift()
                let counter = 0;
                let timer = setInterval(() => {
                    if (counter == 30){
                        player.stop();
                        connection.destroy();
                        clearInterval(timer);
                    } else {
                        const requeue = message.client.queue.get(message.guild.id);
                        if (requeue.queue.length > 0){
                            play(requeue.queue[0])
                            clearInterval(timer)
                        }
                    }
                    counter ++;
                },1000);
            })
        }
    }
}
