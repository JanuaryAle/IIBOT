const fs = require('fs');
const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { keyboard } = require('telegraf/markup');
const query = require('./queryProduct')


let prodList = []
let element
let callbackQuery
let elementAdditionPosition
let name
let flag
let redKeyboard = [
    [Markup.callbackButton('📋Название услуги', 'названию услуги')],
    [Markup.callbackButton('📝Описание услуги', 'описанию услуги')],
    [Markup.callbackButton('💰Стоимость услуги', 'стоимости услуги')],
    [Markup.callbackButton('🙎🏼‍♂️Контакт', 'контакту')],
    [Markup.callbackButton('🏞Изображение', 'изображению')],
    [Markup.callbackButton('🔙Вернуться в меню админа', 'return')],
]

class ProductSceneGenerator{

    GetProductStage() {
        const item = new WizardScene('prodRed', 
        async (ctx) => {
            const promise = query.getAll()
            await ctx.replyWithHTML("Вы редактируете блок услуг", Extra.markup(Markup.removeKeyboard()))
            promise.then(async (data) =>{
                flag = false
                prodList = data
                replyBeginMes(ctx)
                return ctx.wizard.next()
                })
            
            }, async (ctx) => {
                try {  
                    if (typeof ctx.callbackQuery !== "undefined") {
                    if (ctx.callbackQuery.data === 'add'){
                        flag = false
                        element = {}
                        elementAdditionPosition = 0
                        await ctx.editMessageText(`Для добавления новых элементов следуйте инструкциям`
                        + `\n\nНазвание услуги: ${element.name ? element.name : "✖️"}\n`
                        + `Описание услуги: ${element.description ? element.description: "✖️"}\n`
                        + `Стоимость: ${element.price ? element.price : "✖️"}\n`
                        + `Ссылка на контакт: ${element.contact ? element.contact : "✖️"}\n`
                        + `Ссылка на изображение: ${element.imageSrc ? element.imageSrc : "✖️"}\n\n` + `<b>Введите название услуги:</b>`, 
                        Extra.HTML()
                        .markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Вернуться к услугам', 'отмена')])))             
                        return ctx.wizard.next()
                    }                                  
                    name = ctx.callbackQuery.data
                    element = prodList.filter(item => item.name === name)[0]

                    if (typeof element !== "undefined"){
                        flag = false             
                        editProduct(ctx)   
                        return ctx.wizard.selectStep(3)
                    }                   
                }} catch(e) {}
            }, async (ctx) => {
                try {
                    if (typeof ctx.message !== "undefined")
                    if (elementAdditionPosition <= 4){
                        const data = ctx.message.text
                        if (typeof data == "undefined") throw new Error()
                        var message
                        switch(elementAdditionPosition){
                            case 0: {
                                element.name = data
                                if (prodList.find(item => item.name === element.name)) throw new Error()
                                message = "Введите описание услуги: "
                                break;
                            }
                            case 1: {
                                element.description = data
                                message = "Введите стоимость услуги:  "
                                break;
                            }
                            case 2: {
                                element.price = data
                                message = "Отправьте контакт: "
                                break;
                            }case 3: {
                                element.contact = data
                                message = "Отправьте ссылку на изображение. Если не хотите использовать, напишите нет :"
                                break;
                            }
                            case 4: {
                                element.imageSrc = data
                                const promise1 = query.create(element)
                                promise1.then(async data =>
                                {
                                    await ctx.replyWithHTML(`Услуга успешно добавлена!\nВы сможете в дальнейшем отредактировать какой-либо пункт...`,
                                    Extra.HTML({parse_mode: 'HTML'})
                                    .markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Вернуться к услугам', 'отмена')])))
                                    prodList.push(data)
                                }).catch( async () => {
                                    await ctx.reply(`Не удалось загрузить услугу, возможно не выполнено условие уникальности`)
                                })
                            }
                        }
                        elementAdditionPosition += 1
                        if (elementAdditionPosition <= 4)
                        await ctx.reply(`<b>${message}</b>`, Extra.HTML({parse_mode: 'HTML'})
                        .markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Вернуться к услугам', 'отмена')])))
                        }
                }catch(e){
                    await ctx.reply("Введены некорректные данные, попробуйте еще раз")
                }
            }, async (ctx) => {
                try{
                    if (typeof ctx.callbackQuery !== "undefined")
                    if (ctx.callbackQuery.data === "del"){
                        const promise = query.remove(element)
                        const timeout = setTimeout( () => {
                            replyBeginMes(ctx)
                            return ctx.wizard.selectStep(1)
                        }, 2000 )
                        promise.then(async data => {
                            await ctx.reply("Услуга успешно удалена", Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('Вернуться к услугам', 'отмена')])))
                            prodList = prodList.filter(item=> item != element)
                            clearTimeout(timeout)
                        }).catch(async err => {
                            await ctx.reply("Не удалось удалить услугу")
                            clearTimeout(timeout)
                        })
                    }else if(ctx.callbackQuery.data === "red"){
                        await ctx.reply(`Что бы вы хотели отредактировать?\n\n`
                            + `Название услуги ${element.name ? element.name : "✖️"}\n\n`
                            + `Описание услуги: ${element.description ? element.description : "✖️"}\n`
                            + `Стоимость: ${element.price ? element.price : "✖️"}\n`
                            + `Ссылка на контакт: ${element.contact ? element.contact : "✖️"}\n`
                            + `Ссылка на изображение: ${element.imageSrc ? element.imageSrc : "✖️"}\n\n`
                            + `*Не допускается совпадение названий статей`,     
                        Extra.HTML().markup(Markup.inlineKeyboard(redKeyboard)))
                        return ctx.wizard.next()
                    }
                } catch(e){}
            }, async (ctx) => {
                try{
                    if (typeof ctx.callbackQuery !== "undefined" && (ctx.callbackQuery.data === "названию услуги" || ctx.callbackQuery.data === "описанию услуги" 
                    || ctx.callbackQuery.data === "стоимости услуги" || ctx.callbackQuery.data === "контакту" || ctx.callbackQuery.data === "изображению") ) {
                        callbackQuery = ctx.callbackQuery.data
                        await ctx.replyWithHTML(`Введите замену ${callbackQuery}`, Extra.HTML().markup(Markup.inlineKeyboard([Markup.callbackButton('✖️Отмена','отмена')])))
                        return ctx.wizard.next()
                }}catch(e){}
            }, async ctx => {
                try{
                    if (typeof ctx.message !== "undefined"){
                        var name = element.name
                        var replace = ctx.message.text
                        if (callbackQuery === 'названию услуги'){
                            if (prodList.find(item => item.title === ctx.message.text)) throw new Error()
                            element.name = replace
                        }else if (callbackQuery === 'описанию услуги'){
                            element.description = replace
                        }else if (callbackQuery === 'стоимости услуги'){
                            element.price = replace
                        }else if (callbackQuery === 'контакту'){
                            element.contact = replace
                        }else if (callbackQuery === 'изображению'){
                            element.imageSrc = replace
                        }else throw new Error()

                        const promise = query.update(element, name)
                        promise.then(async data => {
                            await ctx.reply("Данные обновлены")
                        })
                        replyBeginMes(ctx)
                        return ctx.wizard.selectStep(1)
                }}catch(e){
                    
                    await ctx.reply("Введены некорректные данные, попробуйте еще раз")
                }
            })

        require('../util/startCommand')(item)

        item.hears("🔙Выйти из режима администратора", ctx => {
            ctx.scene.enter('menu')
        })

        item.action('отмена', async ctx => {
            replyBeginMes(ctx)
            await ctx.wizard.selectStep(1)
        })

        item.action('удалить', async ctx => {
            try{
                answers.values = answers.values.filter(item => item != element)
                await fs.writeFileSync("answers.json", `${JSON.stringify(answers)}`);
                ctx.replyWithHTML("Элемент удален")
                replyBeginMes(ctx)
                await ctx.wizard.selectStep(1)
            }catch(e){}
        })

        item.action('return', async ctx => {
            await ctx.scene.enter('admin')
        })
        return item
    }
}


module.exports = new ProductSceneGenerator().GetProductStage()

async function replyBeginMes(ctx)
{
    if (!flag){
        await ctx.replyWithHTML(`<b>Ниже представлен их список</b>\n`+`*Не допускается совпадение названий`,
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
    keyboard.push([Markup.callbackButton('➕Добавить', 'add')])
    keyboard.push([Markup.callbackButton('🔙Вернуться в меню админа', 'return')])
    return keyboard
}

async function editProduct(ctx){
    try{
        await ctx.editMessageText(`\n\nНазвание услуги: ${element.name}\n\n` + `Стоимость услуги: ${element.price}\n\n`
        + `Детали: \n${element.description}\n\nКонтакт: \n${element.contact}\n\nИзображение: \n${element.imageSrc}`,
            Extra.HTML()
            .markup(Markup.inlineKeyboard([
                [Markup.callbackButton('⚒Редактировать', 'red')],
                [Markup.callbackButton('🗑Удалить', 'del')],
                [Markup.callbackButton('✖️Выбрать другую услугу', 'отмена')],
                [Markup.callbackButton('🔙Вернуться в меню админа', 'return')],
            ])))
    }catch(e){}
}