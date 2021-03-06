'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Despesa extends Model {
    static get dates() {
        return super.dates.concat(["data"]);
    }
    static castDates(field, value) {
        if (field == "data") return value ? value.format("YYYY-MM-DD") : value;
    }
    filial() {
        return this.belongsTo('App/Models/Filial')
    }
}

module.exports = Despesa
