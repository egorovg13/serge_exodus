const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const generate = require('./generator.js');

require("dotenv").config();
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {polling:true});

const regKey = /[сС]ер[её]?[гж]а?/

bot.onText(regKey, async (msg, match) => {
  const chatId = msg.chat.id;
  let imgName = './serge' + Math.floor(Math.random() * 100) + '.jpeg';
  console.log(`bot.js imgName is ${imgName}`)

  await generate.generate(imgName);
  console.log('generation complete');

  const buffer = fs.readFileSync(imgName);
  bot.sendPhoto(chatId, buffer);
  
  fs.unlink(imgName, function(){console.log('Pic deleted')});
})

bot.on("polling_error", (err) => console.log(err));