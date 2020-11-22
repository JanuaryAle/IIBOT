const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard, button } = require('telegraf/markup')
const query = require("../queries/queryVictory")


var victoryList = []
var mainStack = []
var element
var elementAdditionPosition = 0
var callbackQuery
var startMessage
var stack = []

let redKeyboard = [
    [Markup.callbackButton('📋Название статьи', 'названию статьи')],
    [Markup.callbackButton('📝Текст статьи', 'тексту статьи')],
    [Markup.callbackButton('❓Викторину', 'викторине')],
    [Markup.callbackButton('🌌Изображение', 'изображению')],
]


class VictorySceneGenerator{

    GetVictoryScene () {
        const item = new WizardScene('redVic',
            async (ctx) => {
                const promise = query.getAll()
                ctx.webhookReply = false
                mainStack.push(startMessage = await ctx.reply("Вы редактируете блок обучения"))
                ctx.webhookReply = true
                promise.then(async (data) =>{
                    stack = []
                    victoryList = data
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
                        }else if (callbackQuery === "печать"){
                            element = {}
                            clearStack(ctx)
                            await ctx.telegram.deleteMessage(startMessage.chat.id, startMessage.message_id)
                            ctx.webhookReply = false
                            mainStack.push(startMessage = await ctx.reply("mes"))
                            ctx.webhookReply = true
                            editBeginMes(ctx)
                        }else if(callbackQuery === "добавить"){
                            element = {}
                            clearStack(ctx)
                            ctx.webhookReply = false
                            stack.push(await ctx.reply("Введите название статьи:", Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена','отмена')]))))
                            ctx.webhookReply = true
                            elementAdditionPosition = 0
                        }else if(callbackQuery === "удалить"){
                            victoryList = victoryList.filter(item=> item.title != element.title)
                            const promise = query.remove(element)
                            ctx.webhookReply = false
                            promise.then(async data => {
                                stack.push(await ctx.reply("Статья успешно удалена", Extra.HTML({parse_mode: 'HTML'})
                                .markup(Markup.inlineKeyboard([[Markup.callbackButton('✖️Вернуться к статьям', 'отмена')],[Markup.callbackButton('Напечатать список', 'печать')]]))))
                                editBeginMes(ctx)
                            }).catch(async err => {
                                stack.push(await ctx.reply("Не удалось удалить статью"))
                            })
                            ctx.webhookReply = true
                            clearStack(ctx)
                        }else if(callbackQuery === "редактировать"){
                            clearStack(ctx)
                        ctx.webhookReply = false
                        stack.push(await ctx.reply(`Что бы вы хотели отредактировать?\n\n`
                            + `Название статьи ${element.title ? element.title : "✖️"}\n\n`
                            + `Текст статьи: ${element.article ? element.article : "✖️"}\n`
                            + `Викторину: ${element.poll ? "✅" : "✖️"}\n`
                            + `Ссылку на изображение: ${element.imageSrc ? element.imageSrc : "✖️"}\n\n`,     
                        Extra.HTML().markup(Markup.inlineKeyboard(redKeyboard))))
                        ctx.webhookReply = true
                        }else if (callbackQuery === "названию статьи" || callbackQuery === "тексту статьи" || callbackQuery === "викторине" || callbackQuery === "изображению" ){ 
                            ctx.webhookReply = false
                            stack.push(await ctx.reply(`Введите замену ${callbackQuery}`))
                            ctx.webhookReply = true
                        }else{
                            clearStack(ctx)
                            element = victoryList.filter(item => item.title === callbackQuery)[0]
                            if (typeof element !== "undefined"){            
                                editVictory(ctx)   
                            }else if (callbackQuery.search(/red/)){
                                const callbackQuery = ctx.callbackQuery.data
                                await ctx.scene.enter(callbackQuery)  
                            }else if (callbackQuery === "admin"){
                                const callbackQuery = ctx.callbackQuery.data
                                await ctx.scene.enter(callbackQuery) 
                            }
                        }
                    }else if(typeof ctx.message !== "undefined" && typeof ctx.message.text !== "undefined" && elementAdditionPosition !== 2){
                        const replace = ctx.message.text
                        if (callbackQuery === "добавить"){
                            addition(ctx, replace)
                        }else if (callbackQuery === "названию статьи"){
                            changeSmth(0, replace, ctx)  
                        }else if (callbackQuery === "тексту статьи"){
                            changeSmth(1, replace, ctx)    
                        }else if (callbackQuery === "изображению" ){
                            changeSmth(3, replace, ctx)  
                        }else if (callbackQuery === "викторине"){
                            ctx.webhookReply = false
                            stack.push(await ctx.reply("Вы ввели что-то неожиданное для меня, попробуйте еще раз...😦"))
                            ctx.webhookReply = true
                        }              
                    }else if(typeof ctx.message !== "undefined" && typeof ctx.message.poll !== "undefined"){
                        const replace = ctx.message.poll
                        if (callbackQuery === "викторине"){
                            changeSmth(2, replace, ctx)  
                        }else if(callbackQuery === "добавить"){
                            addition(ctx, replace)
                        }
                    }else{
                        ctx.webhookReply = false
                        stack.push(await ctx.reply("Вы ввели что-то неожиданное для меня, попробуйте еще раз...😦"))
                        ctx.webhookReply = true
                    }                   
                }catch(e){}
            })

            item.action('отмена', ctx => {
                clearStack(ctx)
                callbackQuery =''
            })

            item.hears(/👩🏻‍🎓|🏢|📈|🧞/, async ctx =>
                {
                    const text = ctx.message.text
                    const scene = text.charAt(0)+text.charAt(1)
                    await ctx.scene.enter(scene)
                }  
              );

            item.leave(async ctx => {
                clearStack(ctx)
                ctx.telegram.deleteMessage(startMessage.chat.id, startMessage.message_id)
            })

            require('../util/globalCommands')(item)

            return item
    }

}
    module.exports = new VictorySceneGenerator().GetVictoryScene()

async function editBeginMes(ctx)
{
    await ctx.telegram.editMessageText(startMessage.chat.id, startMessage.message_id, undefined,`<b>Ниже представлен список викторин 🎲</b>\n`+`*Нежелательно совпадение названий статей`,
    Extra.HTML({parse_mode: 'HTML'})
    .markup(Markup.inlineKeyboard(convertListToMarkup())))
}

async function editVictory(ctx){
    try{
        ctx.webhookReply = false
        stack.push(await ctx.replyWithHTML(`\n\nНазвание статьи: ${element.title}\n\n`
        + `Текст статьи: \n${element.article}\n\nИзображение: \n${element.imageSrc}\n\nВарианты ответа: \n${getButtonsToPrint(element.poll.options)}\n\nИндекс правльного ответа: ${element.poll.correct_option_id ? element.poll.correct_option_id : "не предусмотрен"}`,
            Extra.HTML()
            .markup(Markup.inlineKeyboard([
                [Markup.callbackButton('🛠Редактировать', 'редактировать')],
                [Markup.callbackButton('🗑Удалить', 'удалить')],
                [Markup.callbackButton('✖️Выбрать другую статью', 'отмена')],
            ]))))
        ctx.webhookReply = false
    }catch(e){}
}

function convertListToMarkup(){
    var keyboard = []
    victoryList.forEach((element, i) => {
        keyboard.push([Markup.callbackButton(element.title, `${element.title}`)])
    });
    keyboard.push([Markup.callbackButton('➕Добавить', 'добавить')])
    keyboard.push([Markup.callbackButton('В меню админа', 'admin')])
    return keyboard
}

function changeSmth(num, data, ctx){

    let message
    var name = element.title

    switch(num){
        case 0: {
            element.title = data
            message = "Введите текст статьи"
            if (ctx)
                editBeginMes(ctx)
            break;
        }
        case 1: {
            element.article = data
            message = "Отправьте викторину"
            break;
        }
        case 2: {
            element.poll = data
            message = "Введите ссылку на изображение"
            break;
        }
        case 3: {
            element.imageSrc = data
            message = "Готово"
        }
    }

    if (ctx) {
        const promise = query.update(element, name)
        promise.then(async data => {
            clearStack(ctx)
            ctx.webhookReply = false
            stack.push(await ctx.reply("Данные обновлены", Extra.HTML({parse_mode: 'HTML'})
            .markup(Markup.inlineKeyboard([[Markup.callbackButton('✖️Вернуться к статьям', 'отмена')],[Markup.callbackButton('Напечатать список', 'печать')]]))))
            ctx.webhookReply = true
        })
    }
    return message
}

function clearStack(ctx){ 
    stack.forEach((item, i) => {
            if (item.message_id){
                ctx.telegram.deleteMessage(item.chat.id, item.message_id)
            }
    })
    stack = []
}

function getButtonsToPrint(options){
    var s = ""
    options.forEach(item => {
         s = s + item.text + '\n'
    })
    return s
}

async function addition(ctx, replace){
    const text = changeSmth(elementAdditionPosition, replace)  
    await ctx.telegram.editMessageText( stack[stack.length - 1].chat.id, stack[stack.length - 1].message_id, undefined,
        `\n\nНазвание статьи: ${element.title ? element.title : "✖️"}\n`
    + `Текст статьи: ${element.article ? element.article: "✖️"}\n`
    + `Викторина: ${element.poll ? "✅" : "✖️"}\n`
    + `Ссылка на изображение: ${element.imageSrc ? element.imageSrc : "✖️"}\n\n`
    + `<b>${text}</b>`, Extra.HTML({parse_mode: 'HTML'})
    .markup(Markup.inlineKeyboard([[Markup.callbackButton('✖️Вернуться к статьям', 'отмена')],[Markup.callbackButton('Напечатать список', 'печать')]])))

    elementAdditionPosition += 1
    if (elementAdditionPosition === 4){
        const promise1 = query.create(element)
        clearStack(ctx)
            promise1.then(async data =>
            {
                victoryList.push(data)
                editBeginMes(ctx)
                stack.push(await ctx.replyWithHTML(`Статья успешно добавлена!\nВы сможете в дальнейшем отредактировать какой-либо пункт`, Extra.HTML({parse_mode: 'HTML'})
                .markup(Markup.inlineKeyboard([[Markup.callbackButton('✖️Вернуться к статьям', 'отмена')],[Markup.callbackButton('Напечатать список', 'печать')]]))))                         
            }).catch( async () => {
                stack.push(await ctx.reply(`Не удалось загрузить статью, возможно, не выполнено условие уникальности`, Extra.HTML({parse_mode: 'HTML'})
                .markup(Markup.inlineKeyboard([[Markup.callbackButton('✖️Вернуться к статьям', 'отмена')],[Markup.callbackButton('Напечатать список', 'печать')]]))))
            })
    }
}