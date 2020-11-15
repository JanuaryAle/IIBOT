const fs = require('fs');
const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra');

const fileName = '../info.json'
const file = require(fileName)
const fileNameAnswers = '../answers.json'
const answers = require(fileNameAnswers)

let stack = []
let betw
let begMes
let element
let callbackQuery
let flag
let keyboardIn = Extra.HTML()
.markup(Markup.inlineKeyboard(
[
    [Markup.callbackButton('❓Вопросы', 'вопросы и ответы'),
    Markup.callbackButton('📝Описание', 'описанию')],
    [Markup.callbackButton('📬Контакт', 'контактам'), 
    Markup.callbackButton('🏞Изображение', 'изображению')]
]
))

async function beginMessage(ctx){
    clearStack(ctx)
    if (betw >= 2 || flag){
        ctx.webhookReply = false
        begMes = await ctx.replyWithHTML( `🏛 Информация о фонде\n\n📝 Изображение: ${file.fondInfo.imageSrc}\n\n📝 Описание: ${file.fondInfo.description}\n\n📝 Контакт: ${file.fondInfo.contact}\n\n Что бы вы хотели изменить?`,
        keyboardIn)
        betw = 0
        ctx.webhookReply = true
    }else {
        try{
            ctx.webhookReply = false
            await ctx.telegram.editMessageText(begMes.chat.id, begMes.message_id, undefined,
                `🏛 Информация о фонде\n\n📝 Изображение: ${file.fondInfo.imageSrc}\n\n📝`
                + ` Описание: ${file.fondInfo.description}\n\n📝 Контакт: ${file.fondInfo.contact}\n\n Что бы вы хотели изменить?`,
                keyboardIn)
            }finally{
                ctx.webhookReply = true
            }
    }
    await ctx.wizard.selectStep(1)
}

class FondSceneGenerator{

    GetFondStage() {
        const item = new WizardScene('fondRed', 
        async ctx => {
            flag = true
            beginMessage(ctx)
            flag = false
            return await ctx.wizard.next()
        },async ctx => {
            if (typeof ctx.callbackQuery !== "undefined"){
                callbackQuery = ctx.callbackQuery.data
                ctx.webhookReply = false
                if (callbackQuery === "контактам" || callbackQuery === "изображению"|| callbackQuery === "описанию"){                   
                    stack.push(await ctx.reply(`Введите замену ${callbackQuery}`, Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена', 'отмена')]))))
                    ctx.webhookReply = true
                    return ctx.wizard.next() 
                }else if (callbackQuery === "вопросы и ответы"){ 
                    stack.push(await ctx.replyWithHTML("Список вопросов и ответов", Extra.HTML().markup(Markup.inlineKeyboard(convertKeyboard(answers.values)))))
                    ctx.webhookReply = true
                    return ctx.wizard.selectStep(3)
            }}
        }, async ctx => {
            try{
                const replace = ctx.message.text
                if (typeof replace !== 'undefined')
                {
                    if (callbackQuery === 'контактам'){
                        file.fondInfo.contact = replace
                        updateInfo(ctx)
                    }else if (callbackQuery === 'описанию'){                     
                        file.fondInfo.description = replace
                        updateInfo(ctx)
                    }else if (callbackQuery === 'изображению'){
                        file.fondInfo.imageSrc = replace
                        updateInfo(ctx)
                    }
                }                        
            }catch(e){console.log(e)}
        }, async ctx => {
            try{
                if (typeof ctx.callbackQuery !== "undefined"){
                    var data = ctx.callbackQuery.data
                    if (data === "add"){
                        element = {}
                        ctx.webhookReply = false
                        stack.push(await ctx.editMessageText("Введите вопрос: ", Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена','отмена')]))))
                        ctx.webhookReply = true
                        return await ctx.wizard.next()
                    }else if (!isNaN(+(data))){
                        ctx.webhookReply = false
                        element = answers.values[+(data)]
                        stack.push(await ctx.editMessageText(`Вопрос:\n${element.question}\n\nОтвет:\n${element.answer}`, Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('🗑Удалить', 'удалить'), Markup.callbackButton('Отмена', 'отмена')]))))
                        ctx.webhookReply = true
                }}
            }catch(e){console.log(e)}
        }, async ctx => {
            try{
                if (typeof ctx.message !== "undefined"){
                    const text = ctx.message.text
                    if (typeof text !== 'undefined'){
                        element.question = text
                        ctx.webhookReply = false
                        stack.push(await ctx.reply("Введите ответ: ", Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена','отмена')]))))
                        ctx.webhookReply = true
                        return ctx.wizard.next()}
            }}catch(e){console.log(e)}
        }, async ctx => {
            try{
                if (typeof ctx.message !== "undefined"){
                    const text = ctx.message.text
                    if (typeof text !== 'undefined'){
                        element.answer = text
                        element.id = answers.values[answers.values.length - 1].id + 1
                        answers.values.push(element)
                        await fs.writeFileSync("answers.json", `${JSON.stringify(answers)}`);
                        await ctx.reply("Элемент добавлен")
                        betw+=1
                        beginMessage(ctx)
                }
            }}catch(e){  
                console.log(e)      
            }
        })

        require('../util/globalCommands')(item)
            
        item.action('отмена', async ctx => {
            beginMessage(ctx)
        })

        item.action('удалить', async ctx => {
            try{
                answers.values = answers.values.filter(item => item != element)
                await fs.writeFileSync("answers.json", `${JSON.stringify(answers)}`);
                betw+=1
                await ctx.replyWithHTML("Элемент удален")
                beginMessage(ctx)
            }catch(e){}
        })

        return item
    }
}

module.exports = new FondSceneGenerator().GetFondStage()

async function updateInfo(ctx){
    try{
        await fs.writeFileSync("info.json", `${JSON.stringify(file)}`);
        betw+=1
        await ctx.reply("Изменения прошли успешно")
        beginMessage(ctx)
    } catch(e){}
} 

function convertKeyboard(element){
    var keyboard = []
    element.forEach((item, i) => {
        keyboard.push([Markup.callbackButton(item.question, `${i}`)])
    })
    keyboard.push([Markup.callbackButton('➕Добавить', 'add'),Markup.callbackButton('Отмена', 'отмена') ])
    return keyboard
}

function clearStack(ctx){
    stack.forEach(item => {
        ctx.telegram.deleteMessage(item.chat.id, item.message_id)
    })
    stack = []
}