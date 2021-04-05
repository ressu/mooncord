const Discord = require('discord.js')
const logSymbols = require('log-symbols');

const database = require('./databaseUtil')
const variables = require('./variablesUtil')
const thumbnail = require('./thumbnailUtil')
const webcam = require('./webcamUtil')

const discordClient = require('../clients/discordclient') 
const messageconfig = require('./statusconfig.json')

async function triggerStatusUpdate (altdiscordClient) {
  console.log(logSymbols.info, `Printer Status: ${variables.getStatus()}`.printstatus)
  const statusConfig = messageconfig[variables.getStatus()]
  
  let client
  if (typeof (altdiscordClient) !== 'undefined') {
    client = altdiscordClient
  } else {
    client = discordClient.getClient()
  }

  setTimeout(async () => {
    const parsedConfig = parseConfig(statusConfig)
    const embed = await generateEmbed(parsedConfig)

    if (typeof (parsedConfig.activity) !== 'undefined') {
      client.user.setActivity(
        parsedConfig.activity.text,
        { type: parsedConfig.activity.type }
      )
    }

    postStatus(embed, client)
  }, 1000)
}

function parseConfig(config) {
  let parsedConfig = JSON.stringify(config)
    .replace(/(\${currentFile})/g, variables.getCurrentFile())
    .replace(/(\${formatedPrintTime})/g, variables.getFormatedPrintTime())
    .replace(/(\${formatedETAPrintTime})/g, variables.getFormatedRemainingTime())
    .replace(/(\${printProgress})/g, variables.getProgress())

  return JSON.parse(parsedConfig)
}

async function generateEmbed(config, user) {
  const snapshot = await webcam.retrieveWebcam()
  const embed = new Discord.MessageEmbed()
    .setColor(config.color)
    .setTitle(config.title)
    .attachFiles([snapshot])
    .setImage(`attachment://${snapshot.name}`)
  
  if (typeof (config.author) !== 'undefined') {
    embed.setAuthor(config.author)
  }
  
  if (config.thumbnail) {
    const thumbnailpic = await thumbnail.retrieveThumbnail()
    embed
      .attachFiles([thumbnailpic])
      .setThumbnail(`attachment://${thumbnailpic.name}`)
  }

  if (typeof (config.fields) !== 'undefined') {
    for (let index in config.fields) {
      embed.addField(config.fields[index].name, config.fields[index].value, true)
    }
  }
  if (config.versions) {
    const currentVersions = variables.getVersions()
    for (let component in currentVersions) {
      if (component !== 'system') {
        let componentdata = currentVersions[component]
        let version = componentdata.version
        if (version !== componentdata.remote_version) {
          version = version.concat(` **(${componentdata.remote_version})**`)
        }
        embed.addField(component, version, true)
      }
    }
  }

  if (typeof (user) === 'undefined') {
    embed.setFooter('Automatic')
    embed.setTimestamp()
  }
  
  return embed
}

function postStatus(message, client) {
  const botdatabase = database.getDatabase()
  for (const guildid in botdatabase.guilds) {
    client.guilds.fetch(guildid)
      .then(async (guild) => {
        const guilddatabase = botdatabase.guilds[guild.id]
        for (const index in guilddatabase.broadcastchannels) {
          const channel = await client.channels.fetch(guilddatabase.broadcastchannels[index])
          channel.send(message)
        }
      })
      .catch((err) => { console.log((err).error) })
  }
}

module.exports.triggerStatusUpdate = async function (altdiscordClient) {
  await triggerStatusUpdate(altdiscordClient)
}

module.exports.getManualStatusEmbed = async function (user) {
  const statusConfig = messageconfig[variables.getStatus()]
  const parsedConfig = parseConfig(statusConfig)
  return await generateEmbed(parsedConfig, user)
}

module.exports.postBroadcastMessage = (message) => { return postStatus(message) }
