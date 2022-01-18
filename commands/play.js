const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require( "@discordjs/voice" );
const { MessageEmbed } = require( "discord.js" );
const ytsearch = require( "yt-search" );
const ytdl = require( "ytdl-core" );

module.exports = {
    name: "play",
    aliases: ["p"],
    voiceChannel: true,

    async execute( client, message, args ){
        const channel = message.member.voice.channel;
        const setqueue = (id, obj) => message.client.queue.set(id, obj);
        let queue = message.client.queue.get(message.guild.id);
        const send = (content) => message.channel.send(content);
        let query = args.join(" ");

        if (Boolean(query)){
            if (query.includes("&t=")){
                let find = query.search("&t=");
                query = query.slice(0,find);
            }
        }
            
        if ((!channel & !query) || (!channel & Boolean(query))){
            const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Erreur")
            .setDescription("Tu n'es pas connecté à un salon vocal")

            return send({embeds:[embed]})
        }

        if (!query & Boolean(channel)){
            if (!queue){
                const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Erreur")
                .setDescription("Tu dois indiquer le nom de la musique")

                return send({embeds:[embed]})
            } else {
                if (queue.queue.length >= 1){
                    if (queue){
                        if (!queue.playing){
                            const embed = new MessageEmbed()
                            .setColor("#551A8B")
                            .setTitle("UNPAUSE")
                            .setDescription(`${queue.queue[0].title}`)
                            
                            queue.player.unpause();
                            return send({embeds:[embed]})
                        }
                    }
                }
            }
        }

        if (Boolean(query) & Boolean(channel)){
            const searchResults = await ytsearch(query);
            const results = searchResults.videos;
            const song = {
                title: results[0]['title'],
                thumbnail : results[0]['thumbnail'],
                url : results[0]['url'],
                id : results[0]['videoId'],
                views : results[0]['views'],
                duration : results[0]['timestamp'],
                author : results[0]['author']
            }

            if (!queue){
                const structure = {
                    channel: message.channel,
                    vc: channel,
                    resource: null,
                    player : null,
                    playing: false,
                    queue: [],
                    connection: null,
                };
                const embed = new MessageEmbed()
                .setColor('#551A8B')
                .setTitle(':cd: Lecture en cours...')
                .setImage(song["thumbnail"])
                .addFields(
                    { name: ':notes: Titre', value: song['title'] },
                    { name: ':alarm_clock: Durée', value: song['duration'] },
                    { name: ':eye: Nombre de vues', value: song['views'].toString()},
                    { name: ':pencil: Auteur', value: song['author']['name']},   
                )

                setqueue(message.guild.id, structure);
                structure.queue.push(song);
                const requeue = message.client.queue.get(message.guild.id);
                requeue.playing = true;
                play(song);

                return send({embeds:[embed]})
            }

            if (Boolean(queue)){
                if (queue.queue.length == 0){
                    const embed = new MessageEmbed()
                    .setColor('#551A8B')
                    .setTitle(':cd: Lecture en cours...')
                    .setImage(song["thumbnail"])
                    .addFields(
                        { name: ':notes: Titre', value: song['title'] },
                        { name: ':alarm_clock: Durée', value: song['duration'] },
                        { name: ':eye: Nombre de vues', value: song['views'].toString()},
                        { name: ':pencil: Auteur', value: song['author']['name']},   
                    )
                    const requeue = message.client.queue.get(message.guild.id);
                    requeue.queue.push(song)
                    requeue.playing = true;
                    play(song);

                return send({embeds:[embed]})
                }
                if (queue.queue.length >= 1){
                    const Queue = message.client.queue.get(message.guild.id);
                    const embed = new MessageEmbed()
                    .setColor('#00008B')
                    .setTitle(":hourglass_flowing_sand: Dans la file d'attente")
                    .setImage(song["thumbnail"])
                    .addFields(
                        { name: ':notes: Titre', value: song['title'] },
                        { name: ':alarm_clock: Durée', value: song['duration'] },
                        { name: ':eye: Nombre de vues', value: song['views'].toString()},
                        { name: ':pencil: Auteur', value: song['author']['name']},   
                    )

                    Queue.queue.push(song)
                    return send({embeds:[embed]})
                }
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
