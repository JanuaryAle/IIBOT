const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const WizardScene = require('telegraf/scenes/wizard')
const bot = require('../bot')

const fileNameAnswers = '../answers.json'
const answers =  require(fileNameAnswers)
const fileName = '../info.json'
const file = require(fileName)

let flag = false
let callbackQuery
let stack = []

class FondSceneGenerator{

    GetFondStage() {
        const item = new WizardScene('fond', 
        async (ctx) => {
            flag = false
            startPoint(ctx)
        }, async ctx => {
            try{
                if (typeof ctx.message !== "undefined" && callbackQuery === "ask"){
                    try{
                        console.log(ctx)
                        const question = {
                            chat_id: ctx.chat.id,
                            message_id: ctx.message.message_id,
                            username: ctx.chat.username,
                            message: ctx.message.text,
                            userId: ctx.from.id,
                            userFirstName: ctx.from.first_name
                        }
                        await ctx.telegram.sendMessage(858239527,
                        `❓❓❓ Вам только что поступил вопрос от пользователя <a href="tg://user?id=${question.userId}">${question.userFirstName}</a>: \n${question.message}`,
                        Extra.HTML())
                        await ctx.reply("Ваше обращение успешно отправлено!")
                        stack = []
                        startPoint(ctx)
                    }catch(e){}
                }else if (typeof ctx.callbackQuery !== "undefined"){
                
                    callbackQuery = ctx.callbackQuery.data
                    if (callbackQuery === 'more'){
                        clearStack(ctx)
                        flag = false
                        try{
                            stack.push(await ctx.replyWithPhoto(file.fondInfo.imageSrc, Extra.load({
                                parse_mode: 'HTML',
                                caption: `<b>${file.fondInfo.name}</b>\n\n${file.fondInfo.description}`
                                +`\n\n<b>${file.fondInfo.contact}</b>`
                            }).markup(Markup.inlineKeyboard([Markup.callbackButton('🔙Назад', 'отмена')]))))
                        }catch(e){} 
                    }else if (callbackQuery === "ask"){
                            clearStack(ctx)
                            flag = false
                            stack.push(await ctx.replyWithHTML("Что бы вы хотели узнать? Отправьте ваш вопрос и наши специалисты напишут вам в ближайшее время", Extra.HTML().markup(Markup.inlineKeyboard([[Markup.callbackButton('🔙Назад', 'отмена')]]))))
                    }
                    else if (callbackQuery === "ques"){
                        clearStack(ctx)
                        flag = false
                        stack.push(await ctx.replyWithHTML("<b>Ниже представлен список часто задаваемых вопросов</b>\nКликните, чтобы увидеть ответ", Extra.HTML().markup(Markup.inlineKeyboard(convertKeyboard(answers.values)))))
                    }else{
                        try {
                            var index = parseInt(callbackQuery)
                            if (index != NaN){
                                flag = false
                                const element = answers.values[+(ctx.callbackQuery.data)]
                                stack.push(await ctx.replyWithHTML(`<b>Вопрос:</b>\n${element.question}\n\n<b>Ответ:</b>\n${element.answer}`))
                            }
                        }catch(e){} 
                    }
                }}catch(e){}
            })

        require('../util/globalCommands')(item)
            
        item.action(/vic|prod|news/, async ctx => {
            const callbackQuery = ctx.callbackQuery.data
            await ctx.scene.enter(callbackQuery)  
        })

        item.action('отмена', ctx => {
            clearStack(ctx)
            callbackQuery =''
        })

        return item
    }
}

module.exports = new FondSceneGenerator().GetFondStage()

  function convertKeyboard(element){
    var keyboard = []
    element.forEach((item, i) => {
        keyboard.push([Markup.callbackButton(item.question, `${i}`)])
    })
    keyboard.push([Markup.callbackButton('🔙Назад', 'отмена')])
    return keyboard
}

async function startPoint(ctx){
    flag = true
    callbackQuery = ''
    await ctx.replyWithHTML(`<b>Добро пожаловать в раздел нашего фонда, ${file.fondInfo.name}</b>\n`
    + `Здесь мы расскажем вам о себе и будем рады услышать ваши вопросы.\n`
    + `Желаете получить оперативный ответ?\n🚀 Возможно, мы уже подготовили его в списке часто задаваемых вопросов😄\n`,
    Extra.HTML()
    .markup(Markup.inlineKeyboard([
        [Markup.callbackButton('🙋‍♀️Давайте знакомиться', `more`)],
        [Markup.callbackButton('🗄Список возможных вопросов', 'ques')],
        [Markup.callbackButton('📝Задайте вопрос', 'ask')]
        ])))
        return ctx.wizard.selectStep(1)
}

function clearStack(ctx){
    
    stack.forEach(item => {
        ctx.telegram.deleteMessage(item.chat.id, item.message_id)
    })

    stack = []
}