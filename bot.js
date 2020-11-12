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

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`)

require('./util/globalCommands')(bot)

//sbot.on('text', ctx => { ctx.reply('i hear u')})

bot.action(/fond|vic|prod|news/, async ctx => {
    const callbackQuery = ctx.callbackQuery.data
    await ctx.reply('enter '+ callbackQuery)
    if (callbackQuery === 'fond' || callbackQuery === 'news')
        await ctx.scene.enter(callbackQuery)        
})


module.exports = bot