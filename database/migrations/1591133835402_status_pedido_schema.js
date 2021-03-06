'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StatusPedidoSchema extends Schema {
  up () {
    this.create('status_pedidos', (table) => {
      table.integer('id').primary()
      table.string('nome', 40).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('status_pedidos')
  }
}

module.exports = StatusPedidoSchema
