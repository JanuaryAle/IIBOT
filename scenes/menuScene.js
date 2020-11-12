const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard } = require('telegraf/markup')
const bcrypt = require('bcryptjs')

const stage = require("../util/stage")

class MenuSceneGenerator{

    GetMenuScene() {
        const item = new Scene('menu')

        require('../util/startCommand')(item)
        
        item.enter(async (ctx) => {
            await ctx.replyWithHTML("Вы находитесь в меню", Extra.markup(Markup.removeKeyboard()))
            await ctx.replyWithHTML("Пожалуйста, выберите интересующий вас раздел:",
            Extra.HTML()
            .markup(Markup.inlineKeyboard([
            [
                Markup.callbackButton('👩🏻‍🎓Обучающий раздел', 'vic'),
                Markup.callbackButton('🏢Фонд', 'fond')],
            [
                Markup.callbackButton('📈Новостная лента', 'news'),
                Markup.callbackButton('🧞Предлагаемые услуги', 'prod')]
            ])),)
        })

        item.command('admin', async ctx => {
            try{
                let m = ctx.message.text.split(" ")
                m = m.filter(item => item != "")
                const password = m[1]

                if (bcrypt.compareSync(password, process.env.ADMIN_PASSWORD))
                     ctx.scene.enter('admin')
                else
                await ctx.reply("У вас нет доступа к данному режиму")
            }catch(e){}
          })

        item.action(/vic|prod|news/, async ctx => {
            const callbackQuery = ctx.callbackQuery.data
            await ctx.scene.leave(callbackQuery)     
        })
               
        return item
    }
}

module.exports = new MenuSceneGenerator().GetMenuScene()

