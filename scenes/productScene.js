const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard } = require('telegraf/markup')
const query = require('../queries/queryProduct')

var prodList 
var element

class ProductSceneGenerator{

    GetProductsScene() {
        const item = new WizardScene('🧞', 
        async (ctx) => {
            const promise = query.getAll()
            promise.then(async (data) =>{
                prodList = data
                ctx.webhookReply = false
                await ctx.replyWithHTML(`${ctx.i18n.t('scenes.prod.text')}`,
                Extra.HTML({parse_mode: 'HTML'})
                .markup(Markup.inlineKeyboard(convertListToMarkup())))              
                ctx.webhookReply = true
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

        item.hears(/👩🏻‍🎓|🏢|📈/, async ctx =>
            {
                const text = ctx.message.text
                const scene = text.charAt(0)+text.charAt(1)
                await ctx.scene.enter(scene)
            }  
          );

        require('../util/globalCommands')(item)
        
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
                    caption: `${ctx.i18n.t('scenes.prod.caption', {name: element.name, price: element.price, description: element.description, contact: element.contact})}`,
                    parse_mode: 'HTML'
                }))
        }catch(e){}}catch(e){}
        ctx.webhookReply = true
}