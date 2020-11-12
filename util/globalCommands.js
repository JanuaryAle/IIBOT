const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const file = require('../info.json')

const help =  `<b>Управлять мной довольно просто:\n\n</b>` 
            + `   ✔️ С помощью команд и кнопок вы всегда найдете нужный раздел\n`
            + `   ✔️ Когда захотите снова увидеть эту инструкию, используйте /help \n`
            + `   ✔️ Чтобы продолжить работу со мной, просто позовите меня!😁 /bot \n\n`
            + `<b>Посмотрите, что я умею 😎... \n\n</b>`
            + `   📈 Наблюдайте за динамичной жизнью фондового рынка с помощью нашей Новостной ленты\n`         
            + `   👩🏻‍🎓 В нашем разделе обучения вы можете найти полезные статьи по акциям, а также поучаствовать в мини-викторине\n`
            + `   🏢 Хотите узнать о нас больше? Информация о фонде будет находиться в разделе Фонд\n`          
            + `   🧞 Советуем вам ознакомиться с нашими продуктами, представленными в разделе Услуги\n`

module.exports = (bot) => {
    bot.start( async ctx => {
        const userId = ctx.from.id
        const userFirstName = ctx.from.first_name
        const sayHello = `<b>Рад видеть вас здесь, <a href="tg://user?id=${userId}">${userFirstName}</a>!</b>`
        const description = `\n\nВиртуальный помощник инвестиционного фонда ${file.fondInfo.name} к вашим услугам!`
        + ` Я буду держать вас в курсе последних новостей фондового рынка, сопровождать на пути инвестирования, а также расскажу о своих преимуществах!`
        const end = `\n\n<i>Добро пожаловать к нам 🏁</i>`
      
        reply = `${sayHello+description+end}`
        await ctx.replyWithHTML(`${reply}`)
        menuCommand(ctx)
      })
    
    bot.help( async ctx => {
        await ctx.replyWithHTML(`${help}`)
    })
    
    bot.command('bot', ctx => menuCommand(ctx))
}

async function menuCommand(ctx){
    await ctx.scene.leave()
    await ctx.replyWithHTML('<b>Чем я могу вам послужить?</b>\nДля перехода в нужный раздел, воспользуйтесь кнопками:',
    Extra.HTML()
    .markup(Markup.inlineKeyboard([
    [
        Markup.callbackButton('👩🏻‍🎓Обучающий раздел', 'vic'),
        Markup.callbackButton('🏢Фонд', 'fond')],
    [
        Markup.callbackButton('📈Новостная лента', 'news'),
        Markup.callbackButton('🧞Наши услуги', 'prod')]
    ])))
}