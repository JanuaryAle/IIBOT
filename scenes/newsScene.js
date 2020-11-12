const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard } = require('telegraf/markup')
const GetNewsList = require('../util/parser')
const { load } = require('telegraf/extra')

var index
var list
var page = 1
var flag
class NewsSceneGenerator{
    GetNewsScene() {
        const item = new Scene('news')

        require('../util/globalCommands')(item)

        item.enter(async ctx => {
        index = 0 
        list = []
        flag = true
        this.printPortion(3, ctx)
        await ctx.replyWithHTML("<b>📉Вы зашли в раздел Новостной ленты📉</b>", Markup.keyboard(
            ['🔎Показать более']).resize().extra())
        await ctx.reply("Здесь мы предоставим вам последние актуальные новости по акциям и компаниям")
        })
        
        item.hears('🔎Показать более', async ctx => {           
            this.show(ctx)
        }) 

        item.action('show', async ctx => 
        {
            this.printPortion(3, ctx)
        })

        item.action(/vic|prod|fond/, async ctx => {
            const callbackQuery = ctx.callbackQuery.data
            if (callbackQuery === "fond")
            await ctx.scene.enter(callbackQuery)
            else
            await ctx.scene.leave()     
        })
        
        return item
    }

    async show(ctx){  
        this.printPortion(2, ctx)  
    }

    async printPortion(k, ctx){
        while (k > 0 && index < list.length) 
        {
            const element = list[index]
            const readMore = `<a href="${element.href}">Посмотрите в источнике</a>`
            await ctx.replyWithHTML(readMore)
            k--
            index += 1
        }
        if (index >= list.length - 2){
            const promise = GetNewsList(page++)
            promise.then((data) => {
                if (flag){
                    list = list.concat(data);
                    if (k > 0) this.printPortion(k, ctx)
                }
            })
        }
    } 
}

module.exports = new NewsSceneGenerator().GetNewsScene()
var page = 0


