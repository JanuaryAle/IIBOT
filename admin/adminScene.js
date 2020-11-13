const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')

class AdminMode{
    GetAdminScene() {
        const item = new Scene('admin')
        require('../util/globalCommands')(item)
        item.enter(async ctx =>
        {
            
            await ctx.reply("<b>Вы находитесь в режиме администратора</b>", Extra.HTML().markup(Markup.inlineKeyboard([
                [Markup.callbackButton('🏢Редактировать информацию о фонде', 'fondRedInAdmin')],
                [Markup.callbackButton('👩🏻‍🎓Редактировать раздел обучения', 'victRedInAdmin')],
                [Markup.callbackButton('🧞Редактировать раздел услуг', 'prodRedInAdmin')],
            ])))            
        })

        item.action('fondRedInAdmin', async ctx => 
        {
            ctx.scene.enter('fondRed')
        })

        item.action('victRedInAdmin', async ctx => 
        {
            ctx.scene.enter('victRed')
        })

        item.action('prodRedInAdmin', async ctx => 
        {
            ctx.scene.enter('prodRed')
        })

        return item
    }
    
}

module.exports = new AdminMode().GetAdminScene()