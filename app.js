const Discord = require('discord.js');
const config = require('./config.json');
var fs = require("fs");
const client = new Discord.Client();

function printAccount(a) {
    let k = ""
    for (key in a) {
        if (!a[key])
            continue;
        k += key;
        k += " : "
        k += a[key];
        k += '\n'
    }
    if (k) message.channel.send(k);
    else message.channel.send("장부가 비었습니다 !")
}

function record(money, log) {
    fs.writeFile("data.json", JSON.stringify(money), "utf8", () => { })
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


        if (message.content.startsWith('!빚')) {
            const light = message.content.toString().split(' ');
            const result = money[author];

            if (!(light[1] && light[2]))
                return message.channel.send('명령어 오류')
            if (!new RegExp(/[가-힣a-zA-Z]/g).test(light[1]))
                return message.channel.send('이름 입력 오류')
            if (!new RegExp(/^-?[0-9]*$/).test(light[2]))
                return message.channel.send('금액 입력 오류')
            const targetMoney = result[light[1]];
            result[light[1]] = eval(light[2])

            money[author] = result;
            log[author] = [...log[author], `${light[0]} ${light[1]} ${targetMoney}`];
            record(money, log)
            printAccount(money[author])
        } else if (message.content.startsWith('!추가')) {

            const light = message.content.toString().split(' ');
            if (!(light[1] && light[2]))
                return message.channel.send('명령어 오류')
            if (!new RegExp(/[가-힣a-zA-Z]/g).test(light[1]))
                return message.channel.send('이름 입력 오류')
            if (!new RegExp(/^-?[0-9]*$/).test(light[2]))
                return message.channel.send('금액 입력 오류')

            const target = light[1];
            const targetMoney = light[2];
            money[author][target] = eval(money[author][target]) + eval(targetMoney)
            log[author] = [...log[author], message.content.toString()];
            message.channel.send(`${target} : ${money[author][target]}`)
            record(money, log)
        } else if (message.content.startsWith('!취소')) {
            let command;
            if (command = log[author].pop() == undefined)
                return message.channel.send('명령어 오류')
            const light = command.split(' ');
            const target = light[1];
            switch (command) {
                case '!추가':
                    money[author][target] = eval(money[author][target]) - eval(light[2])
                    break;
                case '!삭제':
                case '!빚':
                    money[author][target] = eval(light[2])
            }
            record(money, log)
            printAccount(money[author])
        } else if (message.content.startsWith('!삭제')) {
            const light = message.content.toString().split(' ');

            if (!(light[1]))
                return message.channel.send('명령어 오류')
            if (!new RegExp(/[가-힣a-zA-Z]/g).test(light[1]))
                return message.channel.send('이름 입력 오류')

            const target = light[1];
            const targetMoney = money[author][target];
            money[author][target] = undefined;
            log[author] = [...log[author], message.content.toString() + ` ${targetMoney}`];

            record(money, log)
            printAccount(money[author])
        } else if (message.content.startsWith('!장부')) {
            printAccount(money[author])
        }
    }
});



client.login(config.token);
