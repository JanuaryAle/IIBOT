const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')

class AdminMode{
    GetAdminScene() {
        const item = new Scene('admin')

        require('../util/globalCommands')(item)
        item.enter(async ctx =>
        {
            await ctx.reply("Вы находитесь в режиме администратора", Extra.HTML().markup(Markup.inlineKeyboard([
                [Markup.callbackButton('🏢Редактировать информацию о фонде', 'redFond')],
                [Markup.callbackButton('👩🏻‍🎓Редактировать раздел обучения', 'redVic')],
                [Markup.callbackButton('🧞Редактировать раздел услуг', 'redProd')],
            ])))            
        })

        item.action(/fond|prod|vic|red/, async ctx => {
            const callbackQuery = ctx.callbackQuery.data
            await ctx.scene.enter(callbackQuery)       
        })

        return item
    }
    
}

module.exports = new AdminMode().GetAdminScene()