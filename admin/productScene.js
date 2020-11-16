const fs = require('fs');
const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const query = require('../queries/queryProduct');


let prodList = []
let stack
let element
let callbackQuery
let elementAdditionPosition
let startMessage
let redKeyboard = [
    [Markup.callbackButton('📋Название услуги', 'названию услуги')],
    [Markup.callbackButton('📝Описание услуги', 'описанию услуги')],
    [Markup.callbackButton('💰Стоимость услуги', 'стоимости услуги')],
    [Markup.callbackButton('🙎🏼‍♂️Контакт', 'контакту')],
    [Markup.callbackButton('🏞Изображение', 'изображению')],
    [Markup.callbackButton('🔙Вернуться в меню админа', 'return')],
]

class ProductSceneGenerator{

    GetProductStage() {
        const item = new WizardScene('redProd', 
        async (ctx) => {
            const promise = query.getAll()
            startMessage = await ctx.reply("Вы редактируете раздел услуг")
            promise.then(async (data) =>{
                stack = []
                prodList = data
                console.log(data)
                editBeginMes(ctx)
                return ctx.wizard.next()
            })
        }, async ctx => {
            try{
                if (typeof ctx.callbackQuery !== "undefined"){
                    callbackQuery = ctx.callbackQuery.data
                    if (callbackQuery === "отмена"){
                        element = {}
                        clearStack(ctx)
                    }else if(callbackQuery === "добавить"){
                        element = {}
                        clearStack(ctx)
                        ctx.webhookReply = false
                        stack.push(await ctx.reply("Введите название услуги:", Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена','отмена')]))))
                        ctx.webhookReply = true
                        elementAdditionPosition = 0
                    }else if(callbackQuery === "редактировать"){
                        clearStack(ctx)
                        ctx.webhookReply = false
                        stack.push(await ctx.reply(`Что бы вы хотели отредактировать?\n\n`
                            + `Название услуги ${element.name ? element.name : "✖️"}\n\n`
                            + `Описание услуги: ${element.description ? element.description : "✖️"}\n`
                            + `Стоимость: ${element.price ? element.price : "✖️"}\n`
                            + `Ссылка на контакт: ${element.contact ? element.contact : "✖️"}\n`
                            + `Ссылка на изображение: ${element.imageSrc ? element.imageSrc : "✖️"}\n\n`
                            + `*Нежелательно совпадение названий услуг`,     
                        Extra.HTML().markup(Markup.inlineKeyboard(redKeyboard))))
                        ctx.webhookReply = true
                    }else if(callbackQuery === "удалить") {
                            prodList = prodList.filter(item=> item.name !== element.name)
                            const promise = query.remove(element)
                            promise.then(async data => {
                                await ctx.reply("Услуга успешно удалена")
                                console.log(prodList)
                                editBeginMes(ctx)
                            }).catch(async err => {
                                await ctx.reply("Не удалось удалить статью")
                            })
                            clearStack(ctx)
                    }else if (callbackQuery === "названию услуги" || callbackQuery === "описанию услуги" || callbackQuery === "стоимости услуги" || callbackQuery === "контакту" || callbackQuery === "изображению" ){ 
                        ctx.webhookReply = false
                        stack.push(await ctx.reply(`Введите замену ${callbackQuery}`))
                        ctx.webhookReply = true
                    }else {
                        clearStack(ctx)
                        element = prodList.filter(item => item.name === callbackQuery)[0] 
                        if (typeof element !== "undefined"){            
                            editProduct(ctx)   
                        }else if (callbackQuery.search(/vic|news|fond|prod/)){
                            const callbackQuery = ctx.callbackQuery.data
                            await ctx.scene.enter(callbackQuery)  
                        }
                    }

                }else if(typeof ctx.message !== "undefined" && typeof ctx.message.text !== "undefined"){
                    const replace = ctx.message.text

                    if (callbackQuery === "добавить"){
                        const text = changeSmth(elementAdditionPosition, replace)  
                        await ctx.telegram.editMessageText( stack[stack.length - 1].chat.id, stack[stack.length - 1].message_id, undefined,
                            `\n\nНазвание услуги: ${element.name ? element.name : "✖️"}\n`
                        + `Описание услуги: ${element.description ? element.description: "✖️"}\n`
                        + `Стоимость: ${element.price ? element.price : "✖️"}\n`
                        + `Ссылка на контакт: ${element.contact ? element.contact : "✖️"}\n`
                        + `Ссылка на изображение: ${element.imageSrc ? element.imageSrc : "✖️"}\n\n`
                        + `<b>${text}</b>`, Extra.HTML({parse_mode: 'HTML'})
                        .markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Вернуться к услугам', 'отмена')])))

                        elementAdditionPosition += 1
                        if (elementAdditionPosition === 5){
                            const promise1 = query.create(element)
                            clearStack(ctx)
                                promise1.then(async data =>
                                {
                                    prodList.push(data)
                                    editBeginMes(ctx)
                                    await ctx.replyWithHTML(`Услуга успешно добавлена!\nВы сможете в дальнейшем отредактировать какой-либо пункт`)                            
                                }).catch( async () => {
                                    await ctx.reply(`Не удалось загрузить услугу, возможно, не выполнено условие уникальности`)
                                })
                        }
                    }else if (callbackQuery === "названию услуги"){
                        changeSmth(0, replace, ctx)  
                    }else if (callbackQuery === "описанию услуги"){
                        changeSmth(1, replace, ctx)  
                    }else if (callbackQuery === "стоимости услуги"){
                        changeSmth(2, replace, ctx)  
                    }else if (callbackQuery === "контакту"){
                        changeSmth(3, replace, ctx)  
                    }else if (callbackQuery === "изображению" ){
                        changeSmth(4, replace, ctx)  
                    }                 
                }else{
                    ctx.webhookReply = false
                    stack.push(await ctx.reply("Вы ввели что-то неожиданное для меня, попробуйте еще раз...😦"))
                    ctx.webhookReply = true
                }
            }catch(e){console.log(e)}
        })

        require('../util/globalCommands')(item)

        return item
    }
}

module.exports = new ProductSceneGenerator().GetProductStage()

async function editBeginMes(ctx)
{
    await ctx.telegram.editMessageText(startMessage.chat.id, startMessage.message_id, undefined, `<b>Ниже представлен список услуг</b>\n`+`При добавлении нежелательно совпадение названий`,
    Extra.HTML({parse_mode: 'HTML'})
    .markup(Markup.inlineKeyboard(convertListToMarkup())))
}

function convertListToMarkup(){
    var keyboard = []
    prodList.forEach((element, i) => {
        keyboard.push([Markup.callbackButton(element.name, `${element.name}`)])
    });
    keyboard.push([Markup.callbackButton('➕Добавить', 'добавить')])
    return keyboard
}

async function editProduct(ctx){
    try{
        ctx.webhookReply = false
        stack.push(await ctx.replyWithHTML(`\n\nНазвание услуги: ${element.name}\n\n` + `Стоимость услуги: ${element.price}\n\n`
        + `Детали: \n${element.description}\n\nКонтакт: \n${element.contact}\n\nИзображение: \n${element.imageSrc}`,
            Extra.HTML()
            .markup(Markup.inlineKeyboard([
                [Markup.callbackButton('⚒Редактировать', 'редактировать')],
                [Markup.callbackButton('🗑Удалить', 'удалить')],
                [Markup.callbackButton('✖️Выбрать другую услугу', 'отмена')],
            ]))))
        ctx.webhookReply = true
    }catch(e){}
}

function clearStack(ctx){ 
    stack.forEach((item, i) => {
            if (item.message_id){
                ctx.telegram.deleteMessage(item.chat.id, item.message_id)
            }
    })
    stack = []
}

function changeSmth(num, data, ctx){
    let message
    var name = element.name
    console.log(element)
    switch(num){
        case 0: {
            element.name = data
            message = "Введите описание услуги"
            if (ctx)
                editBeginMes(ctx)
            break;
        }
        case 1: {
            element.description = data
            message = "Введите стоимость услуги"
            break;
        }
        case 2: {
            element.price = data
            message = "Введите контакт"
            break;
        }case 3: {
            element.contact = data
            message = "Введите ссылку на изображение"
            break;
        }
        case 4: {
            element.imageSrc = data
            message = "Готово"
        }
    }

    if (ctx) {
        const promise = query.update(element, name)
        promise.then(async data => {
            clearStack(ctx)
            ctx.webhookReply = false
            stack.push(await ctx.reply("Данные обновлены"))
            ctx.webhookReply = true
        })
    }
    return message
}