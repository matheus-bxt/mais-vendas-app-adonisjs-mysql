'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PedidoSchema extends Schema {
  up () {
    this.create('pedidos', (table) => {
      table.increments()
      table.datetime('data').notNullable()
      table.decimal('total').notNullable()
      table.string('observacao', 200)
      table.string('enderecoEntrega', 200)
      table.integer('filial_id').unsigned().notNullable().references('id').inTable('filials')
      table.integer('tipo_id').notNullable().references('id').inTable('tipo_pedidos')
      table.integer('status_id').notNullable().references('id').inTable('status_pedidos')
      table.integer('mesa_id').unsigned().references('id').inTable('mesas')
      table.timestamps()
    })
  }

  down () {
    this.drop('pedidos')
  }
}

module.exports = PedidoSchema
