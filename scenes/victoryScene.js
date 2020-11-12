const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard } = require('telegraf/markup')
const query = require("../queries/queryVictory")

var victoryList = []
var element
class VictorySceneGenerator{

    GetVictoryScene () {

        const item = new WizardScene('vic',
            async (ctx) => {
                const promise = query.getAll()
                await ctx.reply("♟Вы посетили обучающий раздел♟", Markup.keyboard(
                    ['🔙Вернуться в меню']).resize().extra())
                promise.then( async (data) =>{
                        victoryList = data
                        getBeginMes(ctx)
                        return ctx.wizard.next()
                    })                    
                    }, async (ctx) => {
                        try {
                            if (typeof ctx.callbackQuery !== "undefined"){   
                                const name = ctx.callbackQuery.data
                                element = victoryList.filter(item => item.title === name)[0]
                                if (typeof element !== "undefined") {
                                    try{
                                        await ctx.replyWithPhoto(element.imageSrc, Extra.load())
                                    }catch(e) {}  
                                    await ctx.replyWithHTML(`<b>${element.title}</b>\n\n${element.article}`,
                                    Extra.HTML()
                                    .markup(Markup.inlineKeyboard([
                                        [Markup.callbackButton('✏️Пройти тестирование', 'test')],
                                        [Markup.callbackButton('👩🏻‍🎓Выбрать другую статью', 'at2step')],
                                    ])))
                                    return ctx.wizard.next()
                            }}         
                        } catch(e) {console.log(e)}
                    }, async (ctx) => {
                        try {
                            if (typeof ctx.callbackQuery !== "undefined")
                            if (ctx.callbackQuery.data === "test") {
                                const deepClone = JSON.parse(JSON.stringify(element.poll));
                                delete deepClone['options']
                                console.log(deepClone)
                                await ctx.replyWithPoll(
                                    element.poll.question,
                                    convertButtons(element.poll.options),
                                    deepClone
                                ) 
                                await ctx.reply('Вернуться в', Extra.HTML().markup(Markup.inlineKeyboard([
                                    Markup.callbackButton('🔙Меню', 'return'),
                                    Markup.callbackButton('👩🏻‍🎓Доступные статьи', 'at2step')])))
                            }
                        }catch(e){console.log(e)}
                    })
             
                    require('../util/globalCommands')(item)

                    item.action(/fond|prod|news/, async ctx => {
                        const callbackQuery = ctx.callbackQuery.data
                        await ctx.scene.leave(callbackQuery)     
                    })
                    
        return item  
    }
}
module.exports = new VictorySceneGenerator().GetVictoryScene()

async function convertListToMarkup(){
    var keyboard = []
    victoryList.forEach((element, i) => {
        keyboard.push([Markup.callbackButton(element.title, `${element.title}`)])
    });
    keyboard.push([Markup.callbackButton('🔙Вернуться в меню', 'return')])
    return keyboard
}

async function getBeginMes(ctx)
{
    await ctx.replyWithHTML(`<b>Ниже для вас представлен список статей 🎲</b>\n\n❓ В конце вы можете проверить свои знания.\n❓ Нажмите на название, чтобы приступить к прочтению...`, 
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