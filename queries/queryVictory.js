const Victory = require('../models/Victory')

module.exports.getAll = async function() {
    try{
        const items = await Victory.find()
        return items
    }catch(e){
    }
}

module.exports.getById = async function(id) {
    try{
        const item = await Victory.find({id: id})
        return item[0]
    }catch(e){
    }
}

module.exports.remove = async function(element){
    try{
        const item = await Victory.remove({title: element.title})
        return item
    }catch(e){
    }
}

module.exports.create = async function(item){
        const victory = new Victory(item)
        try{
            await victory.save()
            return victory
        }catch(e){
        }
    }

module.exports.update = async function(item, title){
    try{
        const victory = await Victory.findOneAndUpdate(
            {title: title},
            {$set: item},
            {new: true}
        )
        return victory
    }catch(e){
    }
}

