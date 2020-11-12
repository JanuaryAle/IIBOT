const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const WizardScene = require('telegraf/scenes/wizard')
const fileNameAnswers = '../answers.json'
const answers =  require(fileNameAnswers)
const fileName = '../info.json'
const file = require(fileName)

let flag = false
let firstCir = true
class FondSceneGenerator{

    GetFondStage() {
        const item = new WizardScene('fond', 
        async (ctx) => {
            flag = false
            startPoint(ctx)
        }, async ctx => {
            try{
                if (typeof ctx.callbackQuery !== "undefined"){
                    const callbackQuery = ctx.callbackQuery.data
                    if (callbackQuery === 'more'){
                        flag = false
                        try{
                            await ctx.replyWithPhoto(file.fondInfo.imageSrc, Extra.load({
                                parse_mode: 'HTML'
                            }))
                        }catch(e){} 
                        await ctx.replyWithHTML(`<b>${file.fondInfo.name}</b>\n\n${file.fondInfo.description}\n\nКонтакты: ${printArray(file.fondInfo.contacts, "📤")}\nАдреса: ${printArray(file.fondInfo.address, "🗺")}`, Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✔️Ок', 'отмена')])))
                    }else if (callbackQuery === "ques"){
                        flag = false
                        await ctx.replyWithHTML("Список часто задаваемых вопросов и ответов на них", Extra.HTML().markup(Markup.inlineKeyboard(convertKeyboard(answers.values))))
                    }else{
                        try {
                            var index = parseInt(callbackQuery)
                            if (index != NaN){
                                flag = false
                                const element = answers.values[+(ctx.callbackQuery.data)]
                                await ctx.replyWithHTML(`Вопрос:\n${element.question}\n\nОтвет:\n${element.answer}`, Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✔️Ок', 'отмена')])))
                            }
                        }catch(e){} 
                    }
            }}catch(e){}
        })

        require('../util/globalCommands')(item)
            
        item.action(/vic|prod|news/, async ctx => {
            const callbackQuery = ctx.callbackQuery.data
            if (callbackQuery === "news")
            await ctx.scene.enter(callbackQuery)  
            else await ctx.scene.leave() 
        })

        item.action('ask', async ctx => {
            flag = false
            await ctx.reply(`Вам с удовольствием ответят наши специалисты:\n\n${printArray(file.fondInfo.contacts, "📝")}`, Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✔️Ок', 'отмена')])))
        })

        item.hears('🔙Вернуться в меню', async ctx => {  
                await ctx.scene.leave()
        })

        return item
    }
}

module.exports = new FondSceneGenerator().GetFondStage()

function printArray(par, smile){
    var array = '\n'
    par.forEach(element => {
      array = `${array} ${smile} ${element}\n`
    });
    return array
  }

  function convertKeyboard(element){
    var keyboard = []
    element.forEach((item, i) => {
        keyboard.push([Markup.callbackButton(item.question, `${i}`)])
    })
    keyboard.push([Markup.callbackButton('✖️Отмена', `отмена`)])
    return keyboard
}

async function startPoint(ctx){
    flag = true
    firstCir = false
    await ctx.replyWithHTML(`<b>Добро пожаловать в раздел нашего фонда, ${file.fondInfo.name}</b>\n`
    + `Здесь мы расскажем вам о себе и будем рады услышать ваши вопросы.`
    + `Желаете получить оперативный ответ?🚀 Возможно, мы уже подготовили его в списке часто задаваемых вопросов😄\n`,
    Extra.HTML()
    .markup(Markup.inlineKeyboard([
        [Markup.callbackButton('🙋‍♀️Давайте знакомиться', 'more')],
        [Markup.callbackButton('🗄Список возможных вопросов', 'ques')],
        [Markup.callbackButton('📝Задайте вопрос', 'ask')],
        [Markup.callbackButton('🔙Вернуться в меню', 'return')]
        ])))
        return ctx.wizard.selectStep(1)
}