
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
require('dotenv').config()

const TOKEN = process.env.BOT_TOKEN
const PORT = process.env.PORT
const URL = process.env.URL

// Настройка бота

const TOKEN = process.env.BOT_TOKEN

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

// Стартовые команды

const help =  `Управлять мной довольно просто ☺️:\n` 
            + `   📍 С помощью команд и кнопок вы всегда найдете нужный раздел\n`
            + `   📍 Когда захотите снова увидеть эту инструкию, используйте /help \n`
            + `   📍 Чтобы продолжить работу со мной, просто позовите меня!😁 /bot \n\n`
            + `Посмотрите, что я умею 😎... \n`
            + `   📍 Наблюдайте за динамичной жизнью фондового рынка с помощью нашей Новостной ленты\n`         
            + `   📍 В нашем разделе обучения вы можете найти полезные статьи по акциям, а также поучаствовать в мини-викторине\n`
            + `   📍 Хотите узнать о нас больше? Информация о фонде будет находиться в разделе Фонд\n`          
            + `   📍 Советуем вам ознакомиться с нашими продуктами, представленными в разделе Услуги\n`

bot.hears('start', async ctx => {
    const userId = ctx.from.id
    const userFirstName = ctx.from.first_name
    const sayHello = `<b>Рад видеть вас здесь, <a href="tg://user?id=${userId}">${userFirstName}</a>!</b>`
    const description = `\n\nВиртуальный помощник инвестиционного фонда ${file.fondInfo.name} к вашим услугам!`
    + `Я буду держать вас в курсе последних новостей фондового рынка, сопровождать на пути инвестирования, а также расскажу о своих преимуществах!`
    const end = `\n\n<i>Добро пожаловать к нам 🏁</i>`
  
    reply = `${sayHello+description+end}`
    await ctx.replyWithHTML(`${reply}`)
    //ctx.scene.enter('menu')
  })

bot.help( async ctx => {
    await ctx.reply(`${help}`)
})

bot.command('bot', async ctx => {
    ctx.replyWithHTML('Чем я могу послужить? Для перехода в нужный раздел, воспользуйтесь кнопками',
    Extra.HTML()
    .markup(Markup.inlineKeyboard([
    [
        Markup.callbackButton('👩🏻‍🎓Обучающий раздел', 'vic'),
        Markup.callbackButton('🏢Фонд', 'fond')],
    [
        Markup.callbackButton('📈Новостная лента', 'news'),
        Markup.callbackButton('🧞Предлагаемые услуги', 'prod')]
])))})

bot.action('news', async ctx => 
{
    await ctx.scene.enter('news')
})

bot.action('fond', async ctx => 
{
    await ctx.scene.enter('fond')
})

bot.action('prod', async ctx => 
{
    await ctx.scene.enter('prod')
})

bot.action('vic', async ctx => 
{
    await ctx.scene.enter('vic')
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

// Бот готов получать посты от телеги, он слушает

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})

