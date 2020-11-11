const TelegramBot = require('node-telegram-bot-api')
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
require('dotenv').config()

const TOKEN = process.env.BOT_TOKEN
const PORT = process.env.PORT
const URL = process.env.URL

// Настройка бота

const bot = new TelegramBot(TOKEN)

bot.on('message', msg => {
    const {chat: {id}} = msg
    bot.sendMessage(id, 'Pong')
})

bot.onText(/\/help (.+)/, (msg, [sorce, match]) => {
    const {chat: {id}} = msg
    bot.sendMessage(id, match)
})

bot.setWebHook(`${URL}/bot${TOKEN}`)

// Добавляем роуты

const app = new Koa()

const router = Router()

router.post(`/bot${TOKEN}`, ctx => {
    const {body} = ctx.request
    console.log(body)
    bot.processUpdate(body)
    ctx.status = 200
})

// Ставим мидлы

app.use(bodyParser())
app.use(router.routes())

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})

