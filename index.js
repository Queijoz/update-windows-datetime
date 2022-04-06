const sys = require('util')
const win = require('node-windows')
const fetch = require('node-fetch')
const fs = require('fs')

const timezone = -3
const dateFormat = 1 // 1 - day/month/year | 2 - month/day/year | 3 - year/month/day
const useLastUpdate = false
const restartExplorer = false
const explorerInterval = 5000

function execCallback(error, stdout) { 
    if (error)
        console.log(error)
    else
        console.log(stdout)
}

if (useLastUpdate){
    try{
        data = fs.readFileSync(`${__dirname}\\log.txt`)
        var log = JSON.parse(data)
        console.log(`Last update: ${log.time} ${log.date}`)

        win.elevate(`cmd /c date ${log.date}`, undefined, execCallback);
        win.elevate(`cmd /c time ${log.time}`, undefined, execCallback);
    }
    catch(error) { console.log(error) }
}

updateWindowsDateTime = async () => {
    let html = 'http://worldclockapi.com/api/json/utc/now'
    fetch(html)
        .then(res => res.json())
        .then(json => {
            hourUTC = json.currentDateTime.match(/T\d\d/i)[0].substr(1)
            mm = json.currentDateTime.match(/\:\d\d/i)[0].substr(1)
            hh = Number(hourUTC) + timezone
            time = `${hh}:${mm}`
            
            year = json.currentDateTime.match(/\d\d\d\d/i)[0]
            month = json.currentDateTime.match(/\-\d\d\-\d\d/i)[0].substr(1, 2)
            day = json.currentDateTime.match(/\-\d\d\-\d\d/i)[0].substr(4)
            if (dateFormat == 3) date = `${year}/${month}/${day}`
            if (dateFormat == 2) date = `${month}/${day}/${year}`
            date = `${day}/${month}/${year}`

            var data = JSON.stringify({
                'date': date,
                'time': time
            })
            console.log(`Current date and time: ${time} ${date}`)
            fs.writeFile('log.txt', data, 'utf8', execCallback)
            
            win.elevate(`cmd /c date ${date}`, undefined, execCallback)
            win.elevate(`cmd /c time ${time}`, undefined, execCallback)
        })
};
closeExplorer = async () => { win.elevate(`taskkill /im explorer.exe -f`, undefined, execCallback) }
openExplorer = async () => { win.elevate(`explorer.exe`, undefined, execCallback) }

updateWindowsDateTime()
if (restartExplorer){
    closeExplorer()
    setTimeout(openExplorer, explorerInterval) }