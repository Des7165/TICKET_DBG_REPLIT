const Discord = require("discord.js")
const client = new Discord.Client({ partials: ["MESSAGE", "USER", "REACTION"] })
const enmap = require("enmap")
const { token, prefix } = require("./config.json")
const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
})

client.on("ready", () => {
    console.log("Ready")

})
client.on("message", async message => {
    if (message.author.bot) return
    if (message.content.indexOf(prefix) !== 0) return

    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()

    if (command == "ticket-setup") {
        // ticket-setup
        if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("You don't have permission to do this") 
        let channel = message.mentions.channels.first()
        if (!channel) return message.channel.send("Usage: !ticket-setup #channel")

        let send = await channel.send(new Discord.MessageEmbed()
            .setTitle("Ticket System")
            .setDescription("React to open a ticket!")
            .setFooter("Ticket System")
            .setColor("00ff00"))
        send.react("🎫")
        settings.set(`${message.guild.id}-ticket`, send.id)
        message.channel.send("Ticket system created")


    }
    if(command == "close"){
        if(!message.channel.name.includes("ticket-")) return message.channel.send("You can only close ticket in a ticket channel!")
        message.channel.delete()
    }

})

client.on("messageReactionAdd", async (reaction, user) => {
    if (user.partial) await user.fetch()
    if (reaction.partial) await reaction.fetch()
    if (reaction.message.partial) await reaction.message.fetch()

    if (user.bot) return

    let ticketID = await settings.get(`${reaction.message.guild.id}-ticket`)
    if (!ticketID) return

    if (reaction.message.id == ticketID && reaction.emoji.name == "🎫") {
        reaction.users.remove(user)

        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                },
            ],
            type: 'text' 
        }).then(async channel =>{
            channel.send(`<@${user.id}>`,  new Discord.MessageEmbed().setTitle("Welcome to your ticket").setDescription("A member of the team will  be here shortly").setColor("00ff00"))
        })
    }
})
client.login(token)