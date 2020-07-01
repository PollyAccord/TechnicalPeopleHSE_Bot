function doPost(e)
{
  var update = JSON.parse(e.postData.contents);
  var DOC = SpreadsheetApp.openById("1tbyCBxMu0MlKntrIbmiRsypVndVy1BYpPqken4ZiN7Q");
//нам нужен только тип "сообщение"
  if (update.hasOwnProperty('message'))
  {
    var msg = update.message;
    var chat_id = msg.chat.id;
    var text = msg.text;
    var msg_array = msg.text.split(" ");
    var date = (msg.date/86400)+25569.125;
    var user = msg.from.username;
    if (msg_array[0] == "/hello")
    {
        send("поиграем в бутылочку с krouk'ом?", chat_id);
    }
    else if (msg_array[0] === "/menu") {
        send("Список команд с пояснением:", chat_id);
    }
    else if (msg_array[0] === "/new_action") {
     // action(msg);
      bot.onText(/\/new_action/, function (msg, chat_id) {action(msg);});
    }
  }
}

const TelegramBot = require('node-telegram-bot-api'); // подключаем node-telegram-bot-api
const token = '1309391065:AAGJkiD_wixzmJTMKIJsDhh8jXgigk7kahY';
const bot = new TelegramBot(token, {polling: true}); //хочу включить бота

function send (msg, chat_id)
{
//Отправляет сообщения в тлг. На вход функции дать сообщение и ID чата, в который нужно провести отправку
var payload = {
'method': 'sendMessage',
'chat_id': String(chat_id),
'text': msg,
'parse_mode': 'HTML'
}
var data = {
"method": "post",
"payload": payload
}
var API_TOKEN = '1309391065:AAGJkiD_wixzmJTMKIJsDhh8jXgigk7kahY'
UrlFetchApp.fetch('https://api.telegram.org/bot' + API_TOKEN + '/', data);
}

//функция записи полученных данных в таблицу
function write_table (data) {
  var spread_sheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spread_sheet.getSheets()[1];
  
  var lastRow = sheet.getLastRow() + 1;
  
  //занесение в базу времени и имени человека, сделавшего запрос
  sheet.setActiveSelection('A' + lastRow).setNumberFormat('@STRING@').setValue(data.date);
  sheet.setActiveSelection('B' + lastRow).setNumberFormat('@STRING@').setValue(data.userUsername);
  sheet.setActiveSelection('С' + lastRow).setNumberFormat('@STRING@').setValue(data.userName);
  sheet.setActiveSelection('D' + lastRow).setNumberFormat('@STRING@').setValue(data.inMessage); //полученное сообщение
  
}

// вопрос с кнопками (вариант 1)
function action(msg){
  var text = 'Вам необходимо:'; //текст
  var options = {
    reply_markup: JSON.stringify({
      inline_keyboard: 
      [
        [{ text: 'Узнать расписание на сегодня', callback_data: '0_1' }],
        [{ text: 'Поменяться сменами', callback_data: '0_2' }]
                                 ], parse_mode: 'Markdown' // Добавляем кнопки, которые есть в вопросе.
    })
  }
  chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id; // Если сообщение отправлял пользователь, то свойство msg.chat.id, если же он кликал на кнопку, то msg.from.id
  bot.sendMessage(chat, text, options); // Отправляем пользователю сообщение
}


//вопрос с кнопками (вариант 2)

//конфигурация клавиатуры 
const request = [
  [
    {
      text: 'Посмотреть расписание', // текст на кнопке
      callback_data: '1' // данные для обработчика событий
    }
  ],
  [
    {
      text: 'Поменяться сменами',
      callback_data: '2'
    }
  ]
];

// обработчик события присылания нам любого сообщения
bot.on('message', (msg) => {
  const chatId = msg.chat.id; //получаем идентификатор диалога, чтобы отвечать именно тому пользователю, который нам что-то прислал
  // отправляем сообщение
  bot.sendMessage(chatId, 'Привет, выбери действие', { // прикрутим клаву
        reply_markup: {
            inline_keyboard: request
        }
    });
});


bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
       let text = ' ';

    if (query.data === '1') {
        text = 'Расписание';
    }

    if (query.data === '2') { 
        text = 'Смены';
    }

    if (text) {
        bot.sendMessage(chatId, text, { // прикрутим клаву
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } else {
        bot.sendMessage(chatId, 'Попробуйте ещё раз', { // прикрутим клаву
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
  });
