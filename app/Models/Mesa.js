'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Mesa extends Model {
    filial() {
        return this.belongsTo('App/Models/Filial')
    }
    status() {
        return this.belongsTo('App/Models/StatusMesa', 'status_id', 'id')
    }
}

module.exports = Mesa
