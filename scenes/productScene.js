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
            promise.then(async (data) =>{
                prodList = data
                flag = false
                replyBeginMes(ctx)
                return ctx.wizard.next()
            })
        }, async ctx => {
            try{
                if (typeof ctx.callbackQuery !== "undefined"){
                    const name = ctx.callbackQuery.data
                    element = prodList.filter(item => item.name === name)[0]
                    if (typeof element !== "undefined"){
                        replyProduct(ctx)   
                    }
            }}catch(e){console.log(e)}
        })

        require('../util/globalCommands')(item)

        item.action(/vic|fond|news/, async ctx => {
            const callbackQuery = ctx.callbackQuery.data
            await ctx.scene.enter(callbackQuery)       
        })
        return item
    }
}

module.exports = new ProductSceneGenerator().GetProductsScene()

async function replyBeginMes(ctx)
{
    if (!flag){
        await ctx.replyWithHTML(`<b>Вы перешли в раздел наших услуг</b>\nЧтобы узнать подробнее об услуге, выберете ее из списка ниже`,
        Extra.HTML({parse_mode: 'HTML'})
        .markup(Markup.inlineKeyboard(convertListToMarkup())))
        flag = true
    }
}

function convertListToMarkup(){
    var keyboard = []
    prodList.forEach((element, i) => {
        keyboard.push([Markup.callbackButton(element.name, `${element.name}`)])
    });
    return keyboard
}

async function replyProduct(ctx){
    try{
        flag = false
        try{
            await ctx.replyWithPhoto(element.imageSrc,
                Extra.load({
                    caption: `<b>${element.name}</b>\n\n` + `Стоимость услуги: ${element.price}\n\n`
                    + `${element.description}\n\n<b>${element.contact}</b>`,
                    parse_mode: 'HTML'
                }))
        }catch(e){}}catch(e){}
}