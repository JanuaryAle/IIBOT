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
var message
const text = "<b>Вы зашли в раздел Новостной ленты</b>\nЗдесь мы предоставим вам последние актуальные новости по акциям и компаниям📉"
class NewsSceneGenerator{
    GetNewsScene() {
        const item = new Scene('news')

        require('../util/globalCommands')(item)

        item.enter(async ctx => {
        index = 0 
        list = []
        flag = true
        this.printPortion(3, ctx)
        message = await ctx.reply(text, Extra.HTML({parse_mode: 'HTML'})
        .markup(Markup.keyboard(
            [['🔎Показать больше'], ['/bot']]).resize()))
        }) 
        
        item.hears('🔎Показать больше', async ctx => {           
            this.show(ctx)
        }) 

        item.action('show', async ctx => 
        {
            this.printPortion(3, ctx)
        })

        item.action(/vic|prod|fond/, async ctx => {
            // await ctx.telegram.editMessageReplyMarkup( message.chat.id, message.message_id, undefined,
            // Extra.HTML().markup(Markup.removeKeyboard()),
            // )
            const callbackQuery = ctx.callbackQuery.data
            await ctx.scene.enter(callbackQuery)  
        }) 
        
        item.leave(async ctx => {
            await ctx.reply('Вы покинули раздел новости...', Extra.markup(Markup.removeKeyboard()))
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


