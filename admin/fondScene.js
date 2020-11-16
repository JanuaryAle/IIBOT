const fs = require('fs');
const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra');

const fileName = '../data/info.json'
const file = require(fileName)
const fileNameAnswers = '../data/answers.json'
const answers = require(fileNameAnswers)

let stack = []
let begMes
let element
let callbackQuery
let isAnsw = true
let keyboardIn = Extra.HTML()
.markup(Markup.inlineKeyboard(
[
    [Markup.callbackButton('❓Вопросы', 'вопросы и ответы'),
    Markup.callbackButton('📝Описание', 'описанию')],
    [Markup.callbackButton('📬Контакт', 'контактам'), 
    Markup.callbackButton('🏞Изображение', 'изображению')]
]
))

async function editMessage(ctx){
    clearStack(ctx)
    try{
        //ctx.webhookReply = false
        await ctx.replyWithHTML(
            `🏛 Информация о фонде\n\n📝 Изображение: ${file.fondInfo.imageSrc}\n\n📝`
            + ` Описание: ${file.fondInfo.description}\n\n📝 Контакт: ${file.fondInfo.contact}\n\n Что бы вы хотели изменить?`,
            keyboardIn)
    }catch(e)
    {
        console.log(e)
    }
    finally{
        //ctx.webhookReply = true
    }  
}

class FondSceneGenerator{

    GetFondStage() {
        const item = new WizardScene('redFond', 
        async ctx => {
            console.log("in fond")
            abort(ctx)
            begMes = await ctx.replyWithHTML(
                 `🏛 Информация о фонде\n\n📝 Изображение: ${file.fondInfo.imageSrc}\n\n📝`
                 + ` Описание: ${file.fondInfo.description}\n\n📝 Контакт: ${file.fondInfo.contact}\n\n Что бы вы хотели изменить?`,
                 keyboardIn)
            //console.log(begMes)
            return await ctx.wizard.next()
        }, async ctx => {
            try{
                if (typeof ctx.callbackQuery !== "undefined"){
                    callbackQuery = ctx.callbackQuery.data
                    if (callbackQuery === "отмена"){
                        abort(ctx)
                    }else if(callbackQuery === "удалить"){
                        try{
                            answers.values = answers.values.filter(item => item != element)
                            await fs.writeFileSync("answers.json", `${JSON.stringify(answers)}`);
                            await ctx.replyWithHTML("Элемент удален")
                            abort(ctx)
                        }catch(e){}
                    }else if(callbackQuery === "добавить"){
                        clearStack(ctx)
                        element = {}
                        ctx.webhookReply = false
                        stack.push(await ctx.replyWithHTML("Введите вопрос: ", Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена','отмена')]))))
                        ctx.webhookReply = true
                    }else if(callbackQuery === "вопросы и ответы"){
                        clearStack(ctx)
                        ctx.webhookReply = false
                        stack.push(await ctx.replyWithHTML("Список вопросов и ответов", Extra.HTML().markup(Markup.inlineKeyboard(convertKeyboard(answers.values)))))
                        ctx.webhookReply = true
                    }else if(callbackQuery === "описанию" || callbackQuery === "контактам" || callbackQuery === "изображению"){
                        clearStack(ctx)
                        ctx.webhookReply = false
                        stack.push(await ctx.reply(`Введите замену ${callbackQuery}`,
                        
                        Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена', 'отмена')]))))
                        ctx.webhookReply = true
                    }else if(!isNaN(+callbackQuery)){
                        ctx.webhookReply = false
                        element = answers.values[+(callbackQuery)]
                        stack.push(await ctx.editMessageText(`Вопрос:\n${element.question}\n\nОтвет:\n${element.answer}`, Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('🗑Удалить', 'удалить'), Markup.callbackButton('Отмена', 'отмена')]))))
                        ctx.webhookReply = true
                    }else if (callbackQuery.search(/vic|news|fond|prod/)){
                        const callbackQuery = ctx.callbackQuery.data
                        await ctx.scene.enter(callbackQuery)  
                    }

                }else if (typeof ctx.message !== "undefined" && typeof ctx.message.text !== "undefined"){
                    const replace = ctx.message.text
                    if (callbackQuery !== ""){
                        clearStack(ctx)
                        if (callbackQuery === 'контактам'){
                            file.fondInfo.contact = replace
                            updateInfo(ctx)
                        }else if (callbackQuery === 'описанию'){
                            file.fondInfo.description = replace
                            updateInfo(ctx)
                        }else if (callbackQuery === 'изображению'){
                            file.fondInfo.imageSrc = replace
                            updateInfo(ctx)
                        }else if (callbackQuery === 'добавить'){
                            if (isAnsw){
                                element.question = replace
                                ctx.webhookReply = false
                                stack.push(await ctx.reply("Введите ответ: ", Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена','отмена')]))))
                                ctx.webhookReply = true
                                isAnsw = false
                            }else {
                                element.answer = replace
                                isAnsw = true
                                element.id = answers.values[answers.values.length - 1].id + 1
                                answers.values.push(element)
                                await fs.writeFileSync("data/answers.json", `${JSON.stringify(answers)}`);
                                await ctx.reply("Элемент добавлен")
                                abort(ctx)
                            }
                        }
                    }
                }else {
                    ctx.reply("Что-то пошло не так, пожалуйста, повторите операцию")
                }
            }catch(e){
                console.log(e)
            }
        })

        require('../util/globalCommands')(item)

        return item
    }
}

module.exports = new FondSceneGenerator().GetFondStage()

async function updateInfo(ctx){
    try{
         await fs.writeFileSync("data/info.json", `${JSON.stringify(file)}`);
         await ctx.reply("Изменения прошли успешно")
         clearStack(ctx)
         editMessage(ctx)
        // ctx.scene.enter('redFond')
    } catch(e){console.log(e)}
} 

function convertKeyboard(element){
    var keyboard = []
    element.forEach((item, i) => {
        keyboard.push([Markup.callbackButton(item.question, `${i}`)])
    })
    keyboard.push([Markup.callbackButton('➕Добавить', 'добавить'),Markup.callbackButton('Отмена', 'отмена') ])
    return keyboard
}

function clearStack(ctx){  
    stack.forEach((item, i) => {
            if (item.message_id){
                ctx.telegram.deleteMessage(item.chat.id, item.message_id)
            }
    })
    stack = []
}

function abort(ctx){
    callbackQuery = ''
    isAnsw = true
    clearStack(ctx)
}