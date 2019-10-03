const Discord = require('discord.js')
const config = require('./config.json')
var fs = require("fs")
const client = new Discord.Client()
let intervals = {}



function printAccount(acconunt, msg) {
    let k = ""
    for (key in acconunt) {
        if (!acconunt[key])
            continue
        if (chcekId(key)) {
            if (client.users.has(key.replace(/[^0-9]/g, ''))) {
                const user = client.users.get(key.replace(/[^0-9]/g, ''))
                k += user.username + " "
            }
        }
        else {
            k += key
        }
        k += " : "
        k += acconunt[key]
        k += '\n'
    }
    if (k) msg.channel.send(k)
    else msg.channel.send("장부가 비었습니다 !")
}

function record(money, log) {
    if (money)
        fs.writeFile("data.json", JSON.stringify(money), "utf8", () => { })
    if (log)
        fs.writeFile("log.json", JSON.stringify(log), "utf8", () => { })
}

function checkCommand(command, args, message) {
    if (command.length != args) {
        message.channel.send('명령어 오류')
        console.log(command)
        return false
    }
    switch (args) {
        case 2:
            if (!(checkName(command[1]) || chcekId(command[1]))) {
                message.channel.send('이름 입력 오류')
                return false
            }
        case 3:
            if (!checkNumber(command[2])) {
                message.channel.send('금액 입력 오류')
                return false
            }

    }
    return true
}

function checkNumber(number) {
    return new RegExp(/^-?[0-9]*$/).test(number)
}

function checkName(name) {
    return new RegExp(/^[가-힣a-zA-Z]+$/).test(name)
}

function chcekId(id) {
    return new RegExp(/^<@[0-9]*>+$/).test(id)
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

//todo  1. 케장콘 2. 남의 장부 살피기

client.on('message', msg => {

    if (msg.content === '!사용법' || msg.content === '!명령어' || msg.content === '!명령') {
        msg.channel.send(`--- 명령어 목록 ---
        !빚 빚진놈 금액
 예) !빚 승민 12000
 내 장부에 승민 12000원 빚이 생김

        !추가 빚진놈 금액
 내 장부에 추가로 빚을 추가함 (음수도 가능).

        !삭제 빚진놈
내 장부에서 빚진놈 사라짐.

        !취소
 직전 명령 취소

        !장부
 내 장부를 보여준다.
        `)
    }
})


client.on('message', message => {
    if (message.content.startsWith('!')) {
        const money = require("./data.json")
        const log = require("./log.json")
        const author = message.author

        if (!money[author]) {
            money[author] = {}
        }

        if (!log[author]) {
            log[author] = []
        }

        const splitedLine = message.content.toString().replace(/ +/g, ' ').split(' ')
        const acconunt = money[author]

        switch (splitedLine[0]) {
            case '!빚': {
                if (!checkCommand(splitedLine, 3, message)) return
                const targetName = splitedLine[1]
                const targetMoney = acconunt[targetName]

                acconunt[targetName] = eval(splitedLine[2])
                money[author] = acconunt
                log[author] = [...log[author], `${splitedLine[0]} ${targetName} ${targetMoney}`]

                record(money, log)
                printAccount(acconunt, message)
                break
            }
            case '!추가': {
                if (!checkCommand(splitedLine, 3, message)) return


                const targetName = splitedLine[1]
                const targetMoney = splitedLine[2]

                acconunt[targetName] = eval(acconunt[targetName]) + eval(targetMoney)
                log[author] = [...log[author], message.content.toString()]

                record(money, log)
                message.channel.send(`${targetName} : ${acconunt[targetName]}`)
                break
            }
            case '!삭제': {
                if (!checkCommand(splitedLine, 2, message)) return


                const targetName = splitedLine[1]
                const targetMoney = acconunt[targetName]
                acconunt[targetName] = undefined

                log[author] = [...log[author], message.content.toString() + ` ${targetMoney}`]
                record(money, log)
                printAccount(acconunt, message)
                break
            }
            case '!취소': {
                const command = log[author].pop() || 'undefined'
                if (command === 'undefined')
                    return message.channel.send('명령어 오류')

                const line = command.split(' ')
                const targetName = line[1]
                const targetMoney = line[2]


                switch (line[0]) {
                    case '!추가':
                        acconunt[target] = eval(acconunt[target]) - eval(targetMoney)
                        break
                    case '!삭제':
                    case '!빚':
                        acconunt[target] = eval(targetMoney)
                        break
                    default:
                        return console.log('!취소 명령어 확인 요망' + command)
                }
                record(money, log)
                printAccount(acconunt, message)
                break
            }
            case '!장부':
                printAccount(acconunt, message)
                break
        }
    }
})

client.on('message', message => {
    if (message.content.startsWith('!주사위')) {
        const splitedLine = message.content.toString().split(' ')
        const dice = splitedLine[1] || 5
        if (checkNumber(dice))
            return message.channel.send(`주사위 결과 ${Math.floor(Math.random() * dice) + 1}`)
        else
            return message.channel.send(`주사위 결과 ${Math.floor(Math.random() * 5) + 1}`)
    }
})


client.on('message', message => {

    if (message.content.startsWith('!독촉취소')) {
        const author = message.author
        if (intervals.author) {
            client.clearInterval(intervals.author)
            intervals.author = undefined
            return message.channel.send(`독촉을 취소했다구리!`)
        } else {
            return message.channel.send(`취소할 독촉이 없다구리!`)
        }
    }

    if (message.content.startsWith('!독촉')) {

        const author = message.author
        const splitedLine = message.content.toString().replace(/ +/g, ' ').split(' ')

        let H = 17
        let M = 00

        if (splitedLine[1]) {
            if (checkNumber(splitedLine[1])) {
                //from 0 to 23 (midnight to 11pm)
                if (eval(splitedLine[1]) < 24 && eval(splitedLine[1]) >= 0)
                    H = splitedLine[1]
            } else if (splitedLine[1] == '취소') {
                if (intervals.author) {
                    client.clearInterval(intervals.author)
                    intervals.author = undefined
                    return message.channel.send(`독촉을 취소했다구리!`)
                } else {
                    return message.channel.send(`취소할 독촉이 없다구리!`)
                }
            }
        }

        if (splitedLine[2]) {
            if (checkNumber(splitedLine[2])) {
                //from 0 to 59 that
                if (eval(splitedLine[2]) < 60 && eval(splitedLine[2]) >= 0)
                    M = splitedLine[2]
            }
        }

        if (intervals.author)
            return message.channel.send(`날 독촉해도 소용없다구리!`)

        const now = new Date()

        let millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), H, M, 0, 0) - now
        if (millisTill10 < 0) {
            millisTill10 += 86400000 // it's after 9am, try 9am tomorrow.
        }

        message.channel.send(`${H}시 ${M}분에 수금하러 갈거다 구리`)

        const interval = client.setInterval(() => {
            const money = require("./data.json")
            const acconunt = money[author]
            let k = ""
            for (key in acconunt) {
                if (!acconunt[key])
                    continue
                if (chcekId(key)) {
                    if (client.users.has(key.replace(/[^0-9]/g, ''))) {
                        const user = client.users.get(key.replace(/[^0-9]/g, ''))
                        k += user
                    }
                }
                else {
                    k += key
                }
                k += " : "
                k += acconunt[key]
                k += '\n'
            }

            if (k) {
                k = author.username + "의 독촉장이다구리\n " + k + "\n"
                message.channel.send(k)
            } else {
                message.channel.send("독촉할 사람이 없다구리!")
                client.clearInterval(interval)
            }
        }, millisTill10)
        intervals.author = interval
    }

})



client.login(config.token)
