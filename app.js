const Discord = require('discord.js');
const config = require('./config.json');
var fs = require("fs");
const client = new Discord.Client();

function printAccount(a, msg) {
    let k = ""
    for (key in a) {
        if (!a[key])
            continue;
        k += key;
        k += " : "
        k += a[key];
        k += '\n'
    }
    if (k) msg.channel.send(k);
    else msg.channel.send("장부가 비었습니다 !")
}

function record(money, log) {
    if (money)
        fs.writeFile("data.json", JSON.stringify(money), "utf8", () => { })
    if (log)
        fs.writeFile("log.json", JSON.stringify(log), "utf8", () => { })
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// 주기적으로 리마인드 시키기
// toss나 카뱅 연동

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
        `);
    }
});


client.on('message', message => {
    if (message.content.startsWith('!')) {
        const money = require("./data.json");
        const log = require("./log.json")
        const author = message.author;

        if (!money[author]) {
            money[author] = {}
        }

        if (!log[author]) {
            log[author] = []
        }

        const splitedLine = message.content.toString().split(' ');

        if (message.content.startsWith('!빚')) {

            const result = money[author];

            if (!(splitedLine[1] && splitedLine[2]))
                return message.channel.send('명령어 오류')
            if (!new RegExp(/[가-힣a-zA-Z]/g).test(splitedLine[1]))
                return message.channel.send('이름 입력 오류')
            if (!new RegExp(/^-?[0-9]*$/).test(splitedLine[2]))
                return message.channel.send('금액 입력 오류')
            const targetMoney = result[splitedLine[1]];
            result[splitedLine[1]] = eval(splitedLine[2])

            money[author] = result;
            log[author] = [...log[author], `${splitedLine[0]} ${splitedLine[1]} ${targetMoney}`];
            record(money, log)
            printAccount(money[author], message)
        } else if (message.content.startsWith('!추가')) {

            if (!(splitedLine[1] && splitedLine[2]))
                return message.channel.send('명령어 오류')
            if (!new RegExp(/[가-힣a-zA-Z]/g).test(splitedLine[1]))
                return message.channel.send('이름 입력 오류')
            if (!new RegExp(/^-?[0-9]*$/).test(splitedLine[2]))
                return message.channel.send('금액 입력 오류')

            const target = splitedLine[1];
            const targetMoney = splitedLine[2];
            money[author][target] = eval(money[author][target]) + eval(targetMoney)
            log[author] = [...log[author], message.content.toString()];
            message.channel.send(`${target} : ${money[author][target]}`)
            record(money, log)
        } else if (message.content.startsWith('!취소')) {
            let command;
            if ((command = log[author].pop()) == undefined)
                return message.channel.send('명령어 오류')
            command = command.split(' ');
            const target = command[1];
            switch (command[0]) {
                case '!추가':
                    money[author][target] = eval(money[author][target]) - eval(command[2])
                    break;
                case '!삭제':
                case '!빚':
                    money[author][target] = eval(command[2])
            }
            record(money, log)
            printAccount(money[author], message)
        } else if (message.content.startsWith('!삭제')) {

            if (!(splitedLine[1]))
                return message.channel.send('명령어 오류')
            if (!new RegExp(/[가-힣a-zA-Z]/g).test(splitedLine[1]))
                return message.channel.send('이름 입력 오류')

            const target = splitedLine[1];
            const targetMoney = money[author][target];
            money[author][target] = undefined;
            log[author] = [...log[author], message.content.toString() + ` ${targetMoney}`];

            record(money, log)
            printAccount(money[author], message)
        } else if (message.content.startsWith('!장부')) {
            printAccount(money[author], message)
        }
    }
});



client.login(config.token);
