const { Client, Intents, Collection } = require('discord.js');
const { readdirSync } = require('fs')

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    disableMentions: 'everyone',
});

client.commands = new Collection();
client.queue = new Map();

const events = readdirSync('./events/').filter(file => file.endsWith('.js'));

console.log(`Chargement des évenement ⌛`);

for (const file of events) {
    const event = require(`./events/${file}`);
    console.log(`🟢 ${file.split('.')[0]}`);
    client.on(file.split('.')[0], event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
};

console.log(`Chargement des commandes ⌛`);

const commands = readdirSync(`./commands/`).filter(files => files.endsWith('.js'));

for (const file of commands) {
    const command = require(`./commands/${file}`);
    console.log(`🟢 ${command.name.toLowerCase()}`);
    client.commands.set(command.name.toLowerCase(), command);
    delete require.cache[require.resolve(`./commands/${file}`)];
};

client.once('ready', ()=>{
    console.log(`Connecté en tant que ${client.user.username}\n-> Disponibe sur ${client.guilds.cache.size} serveurs pour un total de ${client.users.cache.size} utilisateurs`);

    client.user.setActivity('!help');
})

client.login(process.env.TOKEN)
