const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard } = require('telegraf/markup')
const query = require('../queries/queryProduct')

var prodList 
var element

class ProductSceneGenerator{

    GetProductsScene() {
        const item = new WizardScene('prod', 
        async (ctx) => {
            console.log("on fond ok")
            const promise = query.getAll()
            promise.then(async (data) =>{
                prodList = data
                ctx.webhookReply = false
                await ctx.replyWithHTML(`<b>Вы перешли в раздел наших услуг</b>\n\n`
                + `Мы любим нашу работу и вкладываем душу в разработку представленных ниже продуктов.`
                + ` Каждый их них мы используем и для себя, поэтому гарантируем высокий уровень надежности!\n\n`
                + `Узнайте подробнее про услугу, кликнув на нее, и если захотите, то напишите нам ваши впечатления или сделайте заказ.\т`
                + `Мы предоставим вам контакты✨`,
                Extra.HTML({parse_mode: 'HTML'})
                .markup(Markup.inlineKeyboard(convertListToMarkup())))              
                ctx.webhookReply = false
                return ctx.wizard.next()
            }).catch( err => console.log(err))
          
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

function convertListToMarkup(){
    var keyboard = []
    prodList.forEach((element, i) => {
        keyboard.push([Markup.callbackButton(element.name, `${element.name}`)])
    });
    return keyboard
}

async function replyProduct(ctx){
    try{
        ctx.webhookReply = false
        try{
            await ctx.replyWithPhoto(element.imageSrc,
                Extra.load({
                    caption: `<b>${element.name}</b>\n\n` + `Стоимость услуги: ${element.price}\n\n`
                    + `${element.description}\n\n<b>${element.contact}</b>`,
                    parse_mode: 'HTML'
                }))
        }catch(e){}}catch(e){}
        ctx.webhookReply = true
}