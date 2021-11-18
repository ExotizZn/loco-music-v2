const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require( '@discordjs/voice' );
const { MessageEmbed } = require("discord.js");
const ytsearch = require( 'yt-search' );
const ytdl = require( 'ytdl-core' )

module.exports = {
    name: 'play',
    aliases: ['p'],
    voiceChannel: true,

    async execute( client , message , args ) {

        const channel = message.member.voice.channel;

        const error = (err) => message.channel.send(err);
        const send = (content) => message.channel.send(content);
        const setqueue = (id, obj) => message.client.queue.set(id, obj)
        const queue = message.client.queue.get(message.guild.id);

        if (!channel){
            const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle("🔴 Vous n'êtes pas connecté à un salon vocal 🔴")

            return error({embeds:[embed]})
        }

        const query = args.join(" ");

        if (!query & !queue ){
            const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle("🔴 Veuillez indiquer le titre de la musique 🔴")

            return error({embeds:[embed]})
        } 

        const searchResults = await ytsearch(query);
        const result = searchResults.videos

        const song = {
            title: result[0]['title'],
            thumbnail : result[0]['thumbnail'],
            url : result[0]['url'],
            id : result[0]['videoId'],
            views : result[0]['views'],
            duration : result[0]['timestamp'],
            author : result[0]['author']
        }

        if(!queue){
            const structure = {
                channel: message.channel,
                vc: channel,
                volume: 85,
                player : null,
                playing: true,
                queue: [],
                connection: null,
            };
            
            setqueue(message.guild.id, structure);
            structure.queue.push(song);
            const track = message.client.queue.get(message.guild.id);
            play(track.queue[0])

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle(':cd: Lecture en cours...')
                .setImage(result[0]['thumbnail'])
                .addFields(
                    { name: ':notes: Titre', value: song['title'] },
                    { name: ':alarm_clock: Durée', value: song['duration'] },
                    { name: ':eye: Nombre de vues', value: song['views'].toString()},
                    { name: ':pencil: Auteur', value: song['author']['name']},   
                )

            return send({embeds: [embed]})
        } 
        
        if(queue){
            if (queue.queue.length >= 1){
                queue.queue.push(song)
    
                const embed = new MessageEmbed()
                    .setColor('ORANGE')
                    .setTitle(":hourglass_flowing_sand: Dans la file d'attente")
                    .setImage(result[0]['thumbnail'])
                    .addFields(
                        { name: ':notes: Titre', value: song['title'] },
                        { name: ':alarm_clock: Durée', value: song['duration'] },
                        { name: ':eye: Nombre de vues', value: song['views'].toString()},
                        { name: ':pencil: Auteur', value: song['author']['name']},   
                    )
             
                return send({embeds: [embed]})
            } else if (queue.queue.length == 0){
                queue.queue.push(song)
                const track = message.client.queue.get(message.guild.id);

                const embed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle(':cd: Lecture en cours...')
                .setImage(result[0]['thumbnail'])
                .addFields(
                    { name: ':notes: Titre', value: song['title'] },
                    { name: ':alarm_clock: Durée', value: song['duration'] },
                    { name: ':eye: Nombre de vues', value: song['views'].toString()},
                    { name: ':pencil: Auteur', value: song['author']['name']},   
                )

                play(track.queue[0])
                return send({embeds: [embed]})
            } else if (queue.queue.length >= 1 & !queue.playing & !args){
                queue.player.unpause()
                queue.playing = true
            }
        } 

        function play(track){
            const data =  message.client.queue.get(message.guild.id);
            const source = ytdl(track.url,{
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            })

            const resource = createAudioResource(source,{ inlineVolume:true })
            resource.volume.setVolume(1)
            const player = createAudioPlayer()

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            data.player = player
            data.connection = connection
            connection.subscribe(player);
            player.play(resource);

            player.on('idle',()=>{
                data.queue.shift()
                const list = message.client.queue.get(message.guild.id);

                if (list.queue.length == 0){
                    setTimeout(()=>{
                        player.stop()
                        connection.destroy()   
                    },30000) 
                } else {
                    play(list.queue[0])
                }
            })
        } 
    }
}
