const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard } = require('telegraf/markup')
const query = require('../queries/queryProduct')

var flag = false
var prodList 
var index
var element
class ProductSceneGenerator{

    GetProductsScene() {
        const item = new WizardScene('prod', 
        async (ctx) => {
            const promise = query.getAll()
            await ctx.replyWithHTML("🛎Вы перешли в раздел предлагаемых услуг🛎", Markup.keyboard(
                ['🔙Вернуться в меню']).resize().extra())
            promise.then(async (data) =>{
                prodList = data
                flag = false
                replyBeginMes(ctx)
                return ctx.wizard.next()
            })
        }, async ctx => {
            try{
                if (typeof ctx.callbackQuery !== "undefined"){
                    index = +(ctx.callbackQuery.data)
                    if (!isNaN(index)){
                        element = prodList[index]
                        replyProduct(ctx)   
                    }
            }}catch(e){}
        })

        require('../util/globalCommands')(item)

        item.action(/vic|fond|news/, async ctx => {
            const callbackQuery = ctx.callbackQuery.data
            await ctx.scene.leave(callbackQuery)     
        })

        return item
    }
}

module.exports = new ProductSceneGenerator().GetProductsScene()

async function replyBeginMes(ctx)
{
    if (!flag){
        await ctx.replyWithHTML(`Нажмите на кнопку, чтобы увидеть подробности:`,
        Extra.HTML({parse_mode: 'HTML'})
        .markup(Markup.inlineKeyboard(convertListToMarkup())))
        flag = true
    }
}

function convertListToMarkup(){
    var keyboard = []
    prodList.forEach((element, i) => {
        keyboard.push([Markup.callbackButton(element.name, `${i}`)])
    });
    keyboard.push([Markup.callbackButton('🔙Вернуться в меню', 'return')])
    return keyboard
}

async function replyProduct(ctx){
    try{
        flag = false
        try{
            await ctx.replyWithPhoto(element.imageSrc,
                Extra.load())
        }catch(e){}
        await ctx.replyWithHTML(`<b>${element.name}</b>\n\n` + `Стоимость услуги: ${element.price}\n\n`
        + `${element.description}\n\n${element.contact}`,
            Extra.HTML()
            .markup(Markup.inlineKeyboard([
                [Markup.callbackButton('➕Посмотреть другие услуги', 'отмена')],
                [Markup.callbackButton('🔙Вернуться в меню', 'return')],
            ])))
    }catch(e){}
}