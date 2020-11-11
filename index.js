
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
require('dotenv').config()

const bot = require('./bot.js')

const TOKEN = process.env.BOT_TOKEN
const PORT = process.env.PORT

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

// Бот готов получать посты от телеги, он слушает

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})

