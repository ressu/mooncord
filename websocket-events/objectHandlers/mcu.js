const variables = require('../../utils/variablesUtil')

module.exports = (data, connection, discordClient, database) => {
    if(!/(mcu)/g.test(JSON.stringify(data))) { return }
    loopMCUs(data)
}

function loopMCUs(data) {
    Object.keys(data).forEach(mcu => {
      if (!/(temp)/g.test(mcu) && 
          /(mcu)/g.test(mcu)) {
          updateMCU(mcu, data[mcu])
      }
    })
}

function updateMCU(mcu, data) {
    if(typeof(variables.getMCUList()[mcu]) === 'undefined') {
        variables.updateMCUStatus(mcu, data)
        return
    }

    const oldMcuData = variables.getMCUList()[mcu]

    oldMcuData.last_stats.mcu_task_avg = data.last_stats.mcu_task_avg
    oldMcuData.last_stats.mcu_awake = data.last_stats.mcu_awake
    oldMcuData.last_stats.freq = data.last_stats.freq

    variables.updateMCUStatus(mcu, oldMcuData)
}