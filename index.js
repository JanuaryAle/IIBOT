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

app.use((ctx, next) =>{ ctx.method === 'POST' || ctx.url === `/bot${TOKEN}`
  ? bot.handleUpdate(ctx.request.body, ctx.response)
  : next()
  console.log(ctx)
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