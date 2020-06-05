'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TipoPedidoSchema extends Schema {
  up () {
    this.create('tipo_pedidos', (table) => {
      table.integer('id').primary()
      table.string('nome', 40).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('tipo_pedidos')
  }
}

module.exports = TipoPedidoSchema
