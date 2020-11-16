const Telegraf = require('telegraf')

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
const fondSceneA = require('./admin/fondScene')
const productSceneA = require('./admin/productScene')

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
  })

bot.use(session())
bot.use(stage.middleware())
stage.register(fondScene, newsScene, adminScene, victoryScene, fondSceneA, productScene, productSceneA) // productScene, victoryScene,

if (process.env.NODE_ENV === "production")
{
    bot.telegram.setWebhook(`${URL}/bot${TOKEN}`)
}else{
    bot.launch(5000)
}

require('./util/globalCommands')(bot)

bot.action(/fond|news|prod|vic/, async ctx => {
    const callbackQuery = ctx.callbackQuery.data
    await ctx.scene.enter(callbackQuery)        
})

module.exports = bot