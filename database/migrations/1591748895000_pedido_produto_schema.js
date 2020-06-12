'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PedidoProdutoSchema extends Schema {
  up () {
    this.create('pedido_produtos', (table) => {
      table.increments()
      table.integer('quantidade').notNullable()
      table.decimal('precoUnitario').notNullable()
      table.string('observacao', 200)
      table.integer('pedido_id').unsigned().notNullable().references('id').inTable('pedidos')
      table.integer('produto_id').unsigned().notNullable().references('id').inTable('produtos')
      table.timestamps()
    })
  }

  down () {
    this.drop('pedido_produtos')
  }
}

module.exports = PedidoProdutoSchema
