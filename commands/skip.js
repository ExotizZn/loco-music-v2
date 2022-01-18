const { createAudioPlayer, createAudioResource } = require( "@discordjs/voice" );
const { MessageEmbed } = require('discord.js');
const ytdl = require( 'ytdl-core' );

module.exports = {
    name: 'skip',
    aliases:['s'],
    voiceChannel: true,

    async execute( client, message , args) {
        const channel = message.member.voice.channel;
        const queue = message.client.queue.get(message.guild.id);
        const send = (content) => message.channel.send(content);
        
        if ((!channel & !queue) || (!channel & Boolean(queue))){
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Erreur")
                .setDescription("Tu n'es pas connecté à un salon vocal")

            return send({embeds:[embed]})
        }

        if (!queue & Boolean(channel)){
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Erreur")
                .setDescription("Pas de musique dans la file d'attente")

            return send({embeds:[embed]})
        }

        if (Boolean(queue) & Boolean(channel)){
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
                const reQueue = message.client.queue.get(message.guild.id).queue;
                const embed = new MessageEmbed()
                    .setColor('#551A8B')
                    .setTitle(':cd: Lecture en cours...')
                    .setImage(reQueue[0]["thumbnail"])
                    .addFields(
                        { name: ':notes: Titre', value: reQueue[0]['title'] },
                        { name: ':alarm_clock: Durée', value: reQueue[0]['duration'] },
                        { name: ':eye: Nombre de vues', value: reQueue[0]['views'].toString()},
                        { name: ':pencil: Auteur', value: reQueue[0]['author']['name']},   
                    )

                play(reQueue[0])
                return send({embeds:[embed]})
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

            Queue.player = player;
            Queue.connection = connection;
            Queue.resource = resource;

            player.on("idle", () => {
                Queue.queue.shift();
                let counter = 0;
                let timer = setInterval(() => {
                    queue = message.client.queue.get(message.guild.id);
                    if (counter == 30){
                        player.stop();
                        connection.destroy();
                        clearInterval(timer);
                    } 
                    if (queue.queue.length >= 1){
                        clearInterval(timer)
                    };
                    counter ++;
                },1000);
            })
        }
    }
}
