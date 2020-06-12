'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Pedido extends Model {
    static get dates() {
        return super.dates.concat(["data"]);
    }
    static castDates(field, value) {
        if (field == "data") return value ? value.format("YYYY-MM-DD") : value;
    }
    filial() {
        return this.belongsTo('App/Models/Filial')
    }
    tipo() {
        return this.belongsTo('App/Models/TipoPedido', 'tipo_id', 'id')
    }
    status() {
        return this.belongsTo('App/Models/StatusPedido', 'status_id', 'id')
    }
    mesa() {
        return this.belongsTo('App/Models/Mesa', 'mesa_id', 'id')
    }
    pedidoProdutos() {
        return this.hasMany('App/Models/PedidoProduto')
    }
}

module.exports = Pedido
