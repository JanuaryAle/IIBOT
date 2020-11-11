const Telegraf = require('telegraf')
const {
    Markup,
    Extra,
    session
} = Telegraf
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
require('dotenv').config()

const TOKEN = process.env.BOT_TOKEN
const PORT = process.env.PORT
const URL = process.env.URL

// Настройка бота

const bot = new Telegraf(TOKEN)

bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const response_time = new Date() - start
    console.log(`(Response Time: ${response_time})`)
  })

bot.use(session())
//bot.use(stage.middleware())

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`)

bot.on('message', ctx => {
    ctx.reply('Pong')
})

bot.hears(/\/help (.+)/, (ctx, [source, match]) => {
    ctx.reply(match)
})

// Добавляем роуты

const app = new Koa()

const router = Router()

router.post(`/bot${TOKEN}`, async ctx => {
    await bot.handleUpdate(ctx.request.body, ctx.response)  // Наконец-то, эта штука задана правилно и бот реагирует
    ctx.status = 200
})

router.get(`/`, ctx => {    // Все ок, сервер работает
    ctx.status = 200
})

// Ставим мидлы

app.use(bodyParser())
app.use(router.routes())

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})

