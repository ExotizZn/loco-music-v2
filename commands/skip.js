const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require( '@discordjs/voice' );
const { MessageEmbed } = require('discord.js');
const ytdl = require( 'ytdl-core' );

module.exports = {
    name: 'skip',
    aliases:['s'],
    voiceChannel: true,

    async execute( client, message ) {
        const channel = message.member.voice.channel;
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
            const track = message.client.queue.get(message.guild.id);
            if(track.queue.length == 1){
                const embed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle("🔴 Pas de musique dans la file d'attente 🔴")

                return error({embeds:[embed]})
            } else if(queue.queue.length > 1){
                queue.queue.shift()
                const track = message.client.queue.get(message.guild.id);

                const embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle(':cd: Lecture en cours...')
                    .setImage(track.queue[0]['thumbnail']['url'])
                    .addFields(
                        { name: ':notes: Titre', value: track.queue[0]['title'] },
                        { name: ':alarm_clock: Durée', value:  track.queue[0]['duration'] },
                        { name: ':eye: Nombre de vues', value:  track.queue[0]['views'].toString()},
                        { name: ':pencil: Auteur', value:  track.queue[0]['author']['name']},   
                    )

                play(track.queue[0])

                return send({embeds:[embed]})
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

            queue.player.play(resource);
            queue.player.on('idle',()=>{
                queue.queue.shift()
                const list = message.client.queue.get(message.guild.id);

                if (list.queue.length == 0){
                    setTimeout(()=>{
                        queue.player.stop()
                        queue.connection.destroy()   
                    },30000) 
                } else {
                    play(list.queue[0])
                }
            })
            
        } 
    }
}
