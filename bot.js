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
const productScene = require('./scenes/productScene')
const victoryScene = require('./scenes/victoryScene')
const adminScene = require('./admin/adminScene')
const fondSceneA = require('./admin/fondsScene')

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_DB_PASS
    ,{
    useNewUrlParser: true,
})
.then(() => console.log('MongoDb connected'))
.catch(error => console.log(error))

const TOKEN = process.env.BOT_TOKEN
const URL = process.env.URL

const bot = new Telegraf(TOKEN)
const stage = new Stage();


bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const response_time = new Date() - start
    console.log(`(Response Time: ${response_time})`)
    console.log(`(Response Time: ${ctx})`)
  })

bot.use(session())
bot.use(stage.middleware())
stage.register(fondScene, newsScene, productScene, victoryScene, adminScene, fondSceneA)

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`)

require('./util/globalCommands')(bot)

bot.action(/fond|vic|prod|news/, async ctx => {
    const callbackQuery = ctx.callbackQuery.data
    await ctx.scene.enter(callbackQuery)        
})

//bot.launch(5000)
module.exports = bot