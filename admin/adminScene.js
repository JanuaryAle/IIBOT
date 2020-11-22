const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')


let message
class AdminMode{
    GetAdminScene() {
        const item = new Scene('admin')

        require('../util/globalCommands')(item)
        item.enter(async ctx =>
        {
            ctx.webhookReply = false
            message = await ctx.reply("Вы находитесь в режиме администратора", Extra.HTML().markup(Markup.inlineKeyboard([
                [Markup.callbackButton('🏢 Редактировать информацию о фонде', 'redFond')],
                [Markup.callbackButton('👩🏻‍🎓 Редактировать раздел обучения', 'redVic')],
                [Markup.callbackButton('🧞 Редактировать раздел услуг', 'redProd')],
            ])))  
            ctx.webhookReply = true          
        })

        item.action(/red/, async ctx => {           
            const callbackQuery = ctx.callbackQuery.data
            await ctx.scene.enter(callbackQuery) 
            ctx.telegram.deleteMessage(message.chat.id, message.message_id)
        })

        item.hears(/👩🏻‍🎓|🏢|📈|🧞/, async ctx =>
            {
                const text = ctx.message.text
                const scene = text.charAt(0)+text.charAt(1)
                await ctx.scene.enter(scene)
            }  
          );

        return item
    }
    
}

module.exports = new AdminMode().GetAdminScene()