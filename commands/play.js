const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require( '@discordjs/voice' );
const { MessageEmbed } = require("discord.js");
const ytsr = require( 'ytsr' );
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

        if (!channel) return error("Vous n'êtes pas connecté à un salon vocal :x:")

        const query = args.join(" ");

        if (!query) return error("Veuillez indiquer le nom d'une musique :x:")

        const searchResults = await ytsr(query,{ pages: 1 });

        const song = {
            title: searchResults['items'][0]['title'],
            thumbnail : searchResults['items'][0]['bestThumbnail'],
            url : searchResults['items'][0]['url'],
            id : searchResults['items'][0]['id'],
            views : searchResults['items'][0]['views'],
            duration : searchResults['items'][0]['duration'],
            author : searchResults['items'][0]['author'],
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
                .setThumbnail(song['thumbnail']['url'])
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
                    .setThumbnail(song['thumbnail']['url'])
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
                .setThumbnail(song['thumbnail']['url'])
                .addFields(
                    { name: ':notes: Titre', value: song['title'] },
                    { name: ':alarm_clock: Durée', value: song['duration'] },
                    { name: ':eye: Nombre de vues', value: song['views'].toString()},
                    { name: ':pencil: Auteur', value: song['author']['name']},   
                )

                play(track.queue[0])
                return send({embeds: [embed]})
            }
        } 


        function play(track){
            const data =  message.client.queue.get(message.guild.id);
            const source = ytdl(track.url,{
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            })

            if(data.queue.length == 1){
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
                    const a = message.client.queue.get(message.guild.id);

                    if (a.queue.length == 0){
                        setTimeout(()=>{
                            player.stop()
                            connection.destroy()   
                        },30000) 
                    } else {
                        play(a.queue[0])
                    }
                })
            } 
        }
    }
}