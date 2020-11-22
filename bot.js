const Telegraf = require('telegraf')

const {
    Markup,
    Extra,
    Stage,
    session
} = Telegraf

const TelegrafI18n = require('telegraf-i18n')
const path = require("path")

const fondScene = require('./scenes/fondScene')
const newsScene = require('./scenes/newsScene')
const productScene = require('./scenes/productScene')
const victoryScene = require('./scenes/victoryScene')
const adminScene = require('./admin/adminScene')
const fondSceneA = require('./admin/fondScene')
const productSceneA = require('./admin/productScene')
const victorySceneA = require('./admin/victoryScene')

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

const i18n = new TelegrafI18n({
    defaultLanguage: 'en',
    directory: path.resolve(__dirname, 'locales'),
    useSession: true,
    allowMissing: false,
    sessionName: 'session'
});

bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const response_time = new Date() - start
    console.log(`(Response Time: ${response_time})`)
  })

bot.use(session())
bot.use(i18n.middleware());
bot.use(stage.middleware())
stage.register(fondScene, newsScene, adminScene, victoryScene, fondSceneA, productScene, productSceneA, victorySceneA) 

bot.hears(/👩🏻‍🎓|🏢|📈|🧞/, async ctx =>
    {
        const text = ctx.message.text
        const scene = text.charAt(0)+text.charAt(1)
        await ctx.scene.enter(scene)
    }  
);

if (process.env.NODE_ENV === "production")
{
    bot.telegram.setWebhook(`${URL}/bot${TOKEN}`)
}else{
    bot.launch(5000)
}

require('./util/globalCommands')(bot)

module.exports = bot