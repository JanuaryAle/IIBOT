const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const file = require('../data/info.json')
const bcrypt = require('bcryptjs')
const { match } = require('telegraf-i18n')


module.exports = (bot) => {
    bot.start( async ctx => {
        const reply = ctx.i18n.t('start', {
            userId: ctx.from.id,
            userFirstName: ctx.from.first_name,
            name: file.fondInfo.name
        })
        await ctx.replyWithHTML(`${reply}`)
        menuCommand(ctx)
      })
    
    bot.help( async ctx => {
        await ctx.replyWithHTML(`${ctx.i18n.t('help')}`)
    })
    
    bot.command('bot', ctx => menuCommand(ctx))

    bot.action(/^(?:(ru|en))$/, async ctx => {
        const callbackQuery = ctx.callbackQuery.data
        ctx.i18n.locale(callbackQuery);
        const message = ctx.i18n.t('change')
        await ctx.replyWithHTML(message)
        menuCommand(ctx)
    })

    bot.command('admin', async ctx => {
        try{
            let m = ctx.message.text.split(" ")
            m = m.filter(item => item != "")
            const password = m[1]

            if (bcrypt.compareSync(password, process.env.ADMIN_PASSWORD))
                 ctx.scene.enter('admin')
            else
            await ctx.reply(`${ctx.i18n.t('admin')}`)
        }catch(e){}
      })
    
    bot.hears(match('lang'), async ctx => langChange(ctx))
}

async function menuCommand(ctx){
    await ctx.scene.leave()
    await ctx.replyWithHTML(`${ctx.i18n.t('scenes.menu.text')}`,
    Extra.HTML()
    .markup(Markup.keyboard(
        [
            [`${ctx.i18n.t('scenes.menu.buttons.vic')}`,
            `${ctx.i18n.t('scenes.menu.buttons.fond')}`],
            [`${ctx.i18n.t('scenes.menu.buttons.news')}`,
            `${ctx.i18n.t('scenes.menu.buttons.prod')}`],
            [`${ctx.i18n.t('lang')}`, '/bot']
        ]).resize()))
}

async function langChange(ctx){
    await ctx.reply(`${ctx.i18n.t('selectLang')}`,
        Extra.HTML().markup(Markup.inlineKeyboard(
            [
                Markup.callbackButton('🇺🇸 English', 'en'),
                Markup.callbackButton('🇷🇺 Русский', 'ru')
            ]
        ))
    )
}