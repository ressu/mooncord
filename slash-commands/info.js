const { SlashCommand } = require('slash-create');
const Discord = require('discord.js')
const pjson = require('../package.json')
const path = require('path')
const fs = require('fs')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'info',
            description: 'Send a Description about me.'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            const description = `Version: ${pjson.version}\n
                Author: ${pjson.author}\n
                Homepage: ${pjson.homepage}\n`
            
            const logopath = path.resolve(__dirname, '../images/logo.png')

            const logobuffer = await fs.readFileSync(logopath)

            const infoEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Informations')
                .setDescription(description)
                .setThumbnail('https://raw.githubusercontent.com/eliteSchwein/mooncord/master/images/logo.png')

            ctx.send({
                file: {
                    name: 'logo.png',
                    file: logobuffer
                },
                embeds: [infoEmbed.toJSON()]
            });
        }
        catch (err) {
            console.log(err)
            return "Error!"
        }
    }
}