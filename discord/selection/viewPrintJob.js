const { waitUntil } = require('async-wait-until')
const Discord = require('discord.js')

const moonrakerClient = require('../../clients/moonrakerClient')
const chatUtil = require('../../utils/chatUtil')
const handlers = require('../../utils/handlerUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

let commandFeedback
let connection

let lastid = 0

module.exports = async (selection) => {
    const {message, user, guildId, client, customId, values} = selection

    if (message.author.id !== client.user.id) { return }
    if (customId !== 'view_printjob') { return }

    if (!await permission.hasAdmin(user, guildId, client)) {
        await selection.reply(message.channel.send(locale.getAdminOnlyError(user.username)))
        return
    }

    if (typeof (commandFeedback) !== 'undefined') {
        await selection.reply(locale.getCommandNotReadyError(user.username))
        return
    }

    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    connection = moonrakerClient.getConnection()

    let timeout = 0

    await message.removeAttachments()

    await selection.update(chatUtil.getWaitEmbed(user, locale.fileinfo.title, 'thumbnail_not_found.png'))

    const [gcodeFile] = values

    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodeFile}"}, "id": ${id}}`)

    const feedbackInterval = setInterval(async () => {
        if (typeof (commandFeedback) !== 'undefined') {
            if( lastid === id ) { return }
            lastid = id

            await message.removeAttachments()

            if (commandFeedback === 'Not Found!') {
                const fileNotFoundEmbed = new Discord.MessageEmbed()
                    .setColor('#c90000')
                    .setAuthor(gcodeFile)
                    .setDescription(locale.errors.file_not_found)
                await message.edit({
                    embeds: [fileNotFoundEmbed]
                })
            } else {
                await message.edit(commandFeedback)
            }
            lastid = 0
            commandFeedback = undefined
            connection.removeListener('message', handler)
            clearInterval(feedbackInterval)
        }
        if (timeout === 4) {
            await message.removeAttachments()

            const timeoutEmbed = new Discord.MessageEmbed()
                .setColor('#c90000')
                .setAuthor(gcodeFile)
                .setDescription(locale.errors.command_timeout)
            await selection.message.edit({
                embeds: [timeoutEmbed]
            })
            commandFeedback = undefined
            clearInterval(feedbackInterval)
            connection.removeListener('message', handler)
        }
        timeout++
    }, 500)
}

async function handler (message) {
    commandFeedback = await handlers.printFileHandler(message, locale.fileinfo.title, '#0099ff')
    await waitUntil(() => typeof(commandFeedback) !== 'undefined', { timeout: Number.POSITIVE_INFINITY })
    connection.removeListener('message', handler)
}