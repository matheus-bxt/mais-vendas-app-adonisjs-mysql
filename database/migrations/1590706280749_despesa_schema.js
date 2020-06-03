'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DespesaSchema extends Schema {
  up () {
    this.create('despesas', (table) => {
      table.increments()
      table.string('descricao', 80).notNullable()
      table.datetime('data').notNullable()
      table.decimal('valor').notNullable()
      table.integer('filial_id').unsigned().notNullable().references('id').inTable('filials')
      table.timestamps()
    })
  }

  down () {
    this.drop('despesas')
  }
}

module.exports = DespesaSchema
