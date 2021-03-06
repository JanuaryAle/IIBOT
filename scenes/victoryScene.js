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

        const item = new WizardScene('👩',
            async (ctx) => {
                const promise = query.getAll()
                stack = []
                promise.then( async (data) =>{
                        victoryList = data
                        ctx.webhookReply = false
                        await ctx.replyWithHTML(`${ctx.i18n.t('scenes.vic.text')}`, 
                        Extra.HTML({parse_mode: 'HTML'})
                        .markup(Markup.inlineKeyboard(await convertListToMarkup())))                    
                        ctx.webhookReply = true
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
                                        {text: `${ctx.i18n.t('scenes.vic.ok')}`, callback_data: `stop_poll`}
                                    ]]})
                                ctx.webhookReply = false
                                stack.push(await ctx.replyWithPoll(
                                    element.poll.question,
                                    convertButtons(element.poll.options),
                                    deepClone
                                ))
                                ctx.webhookReply = true
                            }
                        }catch(e){}
                    }
                )           
                require('../util/globalCommands')(item)

                item.action(/stop_poll/, async ctx => {
                    clearStack(ctx)
                })

                item.hears(/🏢|📈|🧞/, async ctx =>
                    {
                        const text = ctx.message.text
                        const scene = text.charAt(0)+text.charAt(1)
                        await ctx.scene.enter(scene)
                    }  
                  );

                item.action(/art#(.+)/, async ctx => {
                    
                    const name = ctx.callbackQuery.data.split('#')[1]
                    element = victoryList.filter(item => item.title === name)[0]
                    if (typeof element !== "undefined") {
                        clearStack(ctx)
                        try{
                            ctx.webhookReply = false
                            stack.push(await ctx.replyWithPhoto(element.imageSrc, Extra.load()))
                            ctx.webhookReply = true
                        }catch(e) {}  
                        ctx.webhookReply = false
                        stack.push(await ctx.replyWithHTML(`<b>${element.title}</b>\n\n${element.article}`,
                        Extra.HTML()
                        .markup(Markup.inlineKeyboard([
                            [Markup.callbackButton(`${ctx.i18n.t('scenes.vic.start')}`, 'test')],
                        ]))))
                        ctx.webhookReply = true 
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
    return keyboard
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
    
    stack.forEach((item, i) => {
            if (item.message_id){
                ctx.telegram.deleteMessage(item.chat.id, item.message_id)
            }
    })
    stack = []
}