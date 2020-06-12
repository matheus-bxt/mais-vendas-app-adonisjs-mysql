'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PedidoProduto extends Model {
    pedido() {
        return this.belongsTo('App/Models/Pedido', 'pedido_id', 'id')
    }
    produto() {
        return this.belongsTo('App/Models/Produto', 'produto_id', 'id')
    }
}

module.exports = PedidoProduto
