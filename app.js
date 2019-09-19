const Discord = require('discord.js');
const config = require('./config.json');
var fs = require("fs");
const client = new Discord.Client();


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});



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
    const money = require("./data.json");
    const log = require("./log.json")
    const author = message.author;

    if (message.content.startsWith('!빚')) {
        const light = message.content.toString().split(' ');
        const result = money[author];

        if (!(light[1] && light[2]))
            return message.channel.send('명령어 오류')
        if (!new RegExp(/[가-힣a-zA-Z]/g).test(light[1]))
            return message.channel.send('이름 입력 오류')
        if (!new RegExp(/[0-9]*/).test(light[2]))
            return message.channel.send('금액 입력 오류')
        const targetMoney = result[light[1]];
        result[light[1]] = eval(light[2])

        money[author] = result;
        log[author] = [...log[author], `${light[0]} ${light[1]} ${targetMoney}`];
        fs.writeFile("data.json", JSON.stringify(money), "utf8", () => { })
        fs.writeFile("log.json", JSON.stringify(log), "utf8", () => { })
        const a = money[author]
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
    } else if (message.content.startsWith('!추가')) {

        const light = message.content.toString().split(' ');
        if (!(light[1] && light[2]))
            return message.channel.send('명령어 오류')
        if (!new RegExp(/[가-힣a-zA-Z]/g).test(light[1]))
            return message.channel.send('이름 입력 오류')
        if (!new RegExp(/[0-9]*/).test(light[2]))
            return message.channel.send('금액 입력 오류')

        const target = light[1];
        const targetMoney = light[2];
        money[author][target] = eval(money[author][target]) + eval(targetMoney)
        log[author] = [...log[author], message.content.toString()];
        message.channel.send(`${target} : ${money[author][target]}`)

        fs.writeFile("data.json", JSON.stringify(money), "utf8", () => { })
        fs.writeFile("log.json", JSON.stringify(log), "utf8", () => { })
    } else if (message.content.startsWith('!취소')) {

        const command = log[author].pop();
        console.log(command);
        if (command.startsWith('!추가')) {
            const light = command.split(' ');
            const target = light[1];
            money[author][target] = eval(money[author][target]) - eval(light[2])

        } else if (command.startsWith('!삭제')) {
            const light = command.split(' ');
            const target = light[1];
            money[author][target] = eval(light[2])

        } else if (command.startsWith('!빚')) {
            const light = command.split(' ');
            const target = light[1];
            money[author][target] = eval(light[2])
        }
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

    } else if (message.content.startsWith('!삭제')) {
        const light = message.content.toString().split(' ');

        if (!(light[1]))
            return message.channel.send('명령어 오류')
        if (!new RegExp(/[가-힣a-zA-Z]/g).test(light[1]))
            return message.channel.send('이름 입력 오류')

        const target = light[1];
        const targetMoney = money[author][target];
        money[author][target] = undefined;

        const a = money[author]
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

        log[author] = [...log[author], message.content.toString() + ` ${targetMoney}`];
        fs.writeFile("data.json", JSON.stringify(money), "utf8", () => { })
        fs.writeFile("log.json", JSON.stringify(log), "utf8", () => { })
    } else if (message.content.startsWith('!장부')) {
        const a = money[author]

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


});



client.login(config.token);
