const { SlashCommand } = require('slash-create');
const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')
const core = require('../mooncord')
const statusUtil = require('../utils/statusUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'status',
            description: 'Get the current Print Status'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        const status = statusUtil.getManualStatusEmbed(core.getDiscordClient())

        const files = status.files

        console.log(files)
        
        return "soon very soon?"
    }
}