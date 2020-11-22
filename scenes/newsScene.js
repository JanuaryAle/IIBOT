const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const GetNewsList = require('../util/parser')
const { match } = require('telegraf-i18n')

var index
var list
var page = 1
var flag
var message

class NewsSceneGenerator{
    GetNewsScene() {
        const item = new Scene('📈')

        require('../util/globalCommands')(item)

        item.enter(async ctx => {
        index = 0 
        list = []
        flag = true
        this.printPortion(3, ctx)
        message = await ctx.reply(`${ctx.i18n.t('scenes.news.text')}`, Extra.HTML({parse_mode: 'HTML'})
        .markup(Markup.keyboard(
            [[`${ctx.i18n.t('scenes.news.buttons.more')}`], ['/bot']]).resize()))
        }) 
        
        item.hears(match('scenes.news.buttons.more'), async ctx => {           
            this.show(ctx)
        }) 

        item.hears(/👩🏻‍🎓|🏢|🧞/, async ctx =>
            {
                const text = ctx.message.text
                const scene = text.charAt(0)+text.charAt(1)
                await ctx.scene.enter(scene)
            }  
          );

        item.action('show', async ctx => 
        {
            this.printPortion(3, ctx)
        })
        
        item.leave(async ctx => {
   //         await ctx.reply(`${ctx.i18n.t('scenes.news.leave')}`, Extra.markup(Markup.removeKeyboard()))
            flag = false
        })

        return item
    }

    async show(ctx){  
        this.printPortion(2, ctx)  
    }

    async printPortion(k, ctx){
        while (k > 0 && index < list.length && flag) 
        {
            const element = list[index]
            const readMore = `${ctx.i18n.t('scenes.news.source', {href: element.href})}`
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


