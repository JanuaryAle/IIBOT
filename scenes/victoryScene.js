const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard } = require('telegraf/markup')
const query = require("../queries/queryVictory")

var victoryList = []
var element
var stack

class VictorySceneGenerator{

    GetVictoryScene () {

        const item = new WizardScene('vic',
            async (ctx) => {
                const promise = query.getAll()
                promise.then( async (data) =>{
                        victoryList = data
                        getBeginMes(ctx)
                        return ctx.wizard.next()
                    })                    
                    }, async (ctx) => {
                        try {
                            if (typeof ctx.callbackQuery !== "undefined")
                            if (ctx.callbackQuery.data === "test") {
                                const art = stack.pop()
                                ctx.telegram.deleteMessage(art.chat.id, art.message_id)
                                const deepClone = JSON.parse(JSON.stringify(element.poll));
                                delete deepClone['options']
                                deepClone.reply_markup = JSON.stringify({
                                    inline_keyboard: [[
                                        {text: 'Готово/Отменить', callback_data: `stop_poll`}
                                    ]]})
                                stack.push(await ctx.replyWithPoll(
                                    element.poll.question,
                                    convertButtons(element.poll.options),
                                    deepClone
                                ))
                                return ctx.wizard.next()
                            }
                        }catch(e){}
                    }
                )           
                require('../util/globalCommands')(item)

                item.action(/fond|prod|news/, async ctx => {
                    const callbackQuery = ctx.callbackQuery.data
                    await ctx.scene.leave(callbackQuery)     
                })

                item.action(/stop_poll/, async ctx => {
                    clearStack(ctx)
                })

                item.action(/art#(.+)/, async ctx => {
                    
                    const name = ctx.callbackQuery.data.split('#')[1]
                    console.log(name)
                    element = victoryList.filter(item => item.title === name)[0]
                    if (typeof element !== "undefined") {
                        clearStack(ctx)
                        try{
                            stack.push(await ctx.replyWithPhoto(element.imageSrc, Extra.load()))
                        }catch(e) {}  
                        stack.push(await ctx.replyWithHTML(`<b>${element.title}</b>\n\n${element.article}`,
                        Extra.HTML()
                        .markup(Markup.inlineKeyboard([
                            [Markup.callbackButton('✏️Пройти тестирование', 'test')],
                        ]))))
                        return await ctx.wizard.selectStep(1)
                    }   
                })
                    
        return item  
    }
}
module.exports = new VictorySceneGenerator().GetVictoryScene()

async function convertListToMarkup(){
    var keyboard = []
    victoryList.forEach((element, i) => {
        keyboard.push([Markup.callbackButton(element.title, `art#${element.title}`)])
    });
   // keyboard.push([Markup.callbackButton('Вернуться к списку статей', 'return')])
    return keyboard
}

async function getBeginMes(ctx)
{
    stack = []
    await ctx.replyWithHTML(`<b>Вот вы и в разделе обучения!</b>\nНиже для вас представлен список статей🎲\n\n`
    + `❓В конце каждой вы можете проверить свои знания\n`
    + `❓Нажмите на название, чтобы приступить к прочтению...`, 
    Extra.HTML({parse_mode: 'HTML'})
    .markup(Markup.inlineKeyboard(await convertListToMarkup())))
}

function convertButtons(options)
{
    var keyboard = []
    options.forEach((item) => {
        keyboard.push(item.text)
    });
    return keyboard
}

function clearStack(ctx){
    stack.forEach(item => {
        ctx.telegram.deleteMessage(item.chat.id, item.message_id)
    })
    stack = []
}
