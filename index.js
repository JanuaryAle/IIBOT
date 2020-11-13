const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
require('dotenv').config()
const file = require('./info.json')

const TOKEN = process.env.BOT_TOKEN
const PORT = process.env.PORT
const URL = process.env.URL

// Настройка бота

const bot = require('./bot')

// Добавляем роуты

const app = new Koa()

const router = Router()

router.get(`/`, ctx => {    // Все ок, сервер работает
    ctx.status = 200
})

// Ставим мидлы
app.use(bot.webhookCallback(`/bot${TOKEN}`))

app.use(bodyParser())
app.use(router.routes())

app.use((ctx, next) => ctx.method === 'POST' || ctx.url === '/secret-path'
  ? bot.handleUpdate(ctx.request.body, ctx.response)
  : next()
)

// app.post(`/bot${TOKEN}`, async (ctx) => {
//     console.log(ctx)
//     await bot.handleUpdate(ctx.request.body, ctx.response)  // Наконец-то, эта штука задана правилно и бот реагирует
//     ctx.status = 200
// })

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})