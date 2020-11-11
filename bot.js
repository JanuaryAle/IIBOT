const Telegraf = require('telegraf')
const file = require('./info.json')
const {
    Markup,
    Extra,
    session
} = Telegraf

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

const help =  `<b>Управлять мной довольно просто:\n\n</b>` 
            + `   ✔️ С помощью команд и кнопок вы всегда найдете нужный раздел\n`
            + `   ✔️ Когда захотите снова увидеть эту инструкию, используйте /help \n`
            + `   ✔️ Чтобы продолжить работу со мной, просто позовите меня!😁 /bot \n\n`
            + `<b>Посмотрите, что я умею 😎... \n\n</b>`
            + `   📈 Наблюдайте за динамичной жизнью фондового рынка с помощью нашей Новостной ленты\n`         
            + `   👩🏻‍🎓 В нашем разделе обучения вы можете найти полезные статьи по акциям, а также поучаствовать в мини-викторине\n`
            + `   🏢 Хотите узнать о нас больше? Информация о фонде будет находиться в разделе Фонд\n`          
            + `   🧞 Советуем вам ознакомиться с нашими продуктами, представленными в разделе Услуги\n`

bot.start( async ctx => {
    const userId = ctx.from.id
    const userFirstName = ctx.from.first_name
    const sayHello = `<b>Рад видеть вас здесь, <a href="tg://user?id=${userId}">${userFirstName}</a>!</b>`
    const description = `\n\nВиртуальный помощник инвестиционного фонда ${file.fondInfo.name} к вашим услугам!`
    + ` Я буду держать вас в курсе последних новостей фондового рынка, сопровождать на пути инвестирования, а также расскажу о своих преимуществах!`
    const end = `\n\n<i>Добро пожаловать к нам 🏁</i>`
  
    reply = `${sayHello+description+end}`
    await ctx.replyWithHTML(`${reply}`)
    //ctx.scene.enter('menu')
  })

bot.help( async ctx => {
    await ctx.replyWithHTML(`${help}`)
})

bot.command('bot', async ctx => {
    ctx.replyWithHTML('<b>Чем я могу вам послужить?<b>\n Для перехода в нужный раздел, воспользуйтесь кнопками:',
    Extra.HTML()
    .markup(Markup.inlineKeyboard([
    [
        Markup.callbackButton('👩🏻‍🎓Обучающий раздел', 'vic'),
        Markup.callbackButton('🏢Фонд', 'fond')],
    [
        Markup.callbackButton('📈Новостная лента', 'news'),
        Markup.callbackButton('🧞Наши услуги', 'prod')]
])))})

bot.on('text', ctx => { ctx.reply('i hear u')})

bot.action('news', async ctx => 
{
    ctx.reply('Вы в новостях')
    //await ctx.scene.enter('news')
})

bot.action('fond', async ctx => 
{
    ctx.reply('Вы в фонде')
    //await ctx.scene.enter('fond')
})

bot.action('prod', async ctx => 
{
    ctx.reply('Вы в услугах')
    //await ctx.scene.enter('prod')
})

bot.action('vic', async ctx => 
{
    ctx.reply('Вы в обучении')
    //await ctx.scene.enter('vic')
})

//bot.launch(5000)

module.exports = bot