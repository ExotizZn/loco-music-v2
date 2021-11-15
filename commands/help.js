const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'help',
    voiceChannel: true,

    async execute( client, message ) {
        const send = (content) => message.channel.send(content);

        const embed = new MessageEmbed()
            .setColor('YELLOW')
            .setTitle(':question: Aide :question:')
            .addFields(
                {name: "!play + [titre]", value :"Pour jouer une musique"},
                {name: "!pause", value :"Pour mettre en pause la musique"},
                {name: "!resume", value :"Pour reprendre la musique"},
                {name: "!skip", value :"Pour passer à la musique suivante"},
                {name: "!stop", value :"Pour déconnecter le bot"},
                {name: "!queue (clear)", value :"Pour afficher la file d'attente"},
            )
        send({embeds:[embed]})
    }
}