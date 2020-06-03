'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Produto extends Model {
    filial() {
        return this.belongsTo('App/Models/Filial')
    }
}

module.exports = Produto
