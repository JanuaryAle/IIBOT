const Telegraf = require('telegraf')
const file = require('./info.json')

const {
    Markup,
    Extra,
    Stage,
    session
} = Telegraf

const fondScene = require('./scenes/fondScene')
const newsScene = require('./scenes/newsScene')
//const productScene = require('./scenes/productScene')
//const victoryScene = require('./scenes/victoryScene')

const TOKEN = process.env.BOT_TOKEN
const URL = process.env.URL

const bot = new Telegraf(TOKEN)
const stage = new Stage();


bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const response_time = new Date() - start
    console.log(`(Response Time: ${response_time})`)
  })

bot.use(session())
bot.use(stage.middleware())
stage.register(fondScene, newsScene)


//bot.telegram.setWebhook(`${URL}/bot${TOKEN}`)

const help =  `<b>Управлять мной довольно просто:\n\n</b>` 
            + `   ✔️ С помощью команд и кнопок вы всегда найдете нужный раздел\n`
            + `   ✔️ Когда захотите снова увидеть эту инструкию, используйте /help \n`
            + `   ✔️ Чтобы продолжить работу со мной, просто позовите меня!😁 /bot \n\n`
            + `<b>Посмотрите, что я умею 😎... \n\n</b>`
            + `   📈 Наблюдайте за динамичной жизнью фондового рынка с помощью нашей Новостной ленты\n`         
            + `   👩🏻‍🎓 В нашем разделе обучения вы можете найти полезные статьи по акциям, а также поучаствовать в мини-викторине\n`
            + `   🏢 Хотите узнать о нас больше? Информация о фонде будет находиться в разделе Фонд\n`          
            + `   🧞 Советуем вам ознакомиться с нашими продуктами, представленными в разделе Услуги\n`

require('./util/globalCommands')(bot)

//sbot.on('text', ctx => { ctx.reply('i hear u')})

bot.action(/fond|vic|prod|news/, async ctx => {
    const callbackQuery = ctx.callbackQuery.data
    await ctx.reply('enter '+ callbackQuery)
    if (callbackQuery === 'fond' || callbackQuery === 'news')
        await ctx.scene.enter(callbackQuery)        
})

bot.launch(5000)

module.exports = bot