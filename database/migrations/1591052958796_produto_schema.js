'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProdutoSchema extends Schema {
  up () {
    this.create('produtos', (table) => {
      table.increments()
      table.string('codigo', 10).notNullable()
      table.string('nome', 80).notNullable()
      table.string('descricao', 200)
      table.decimal('custo')
      table.decimal('precoVenda').notNullable()
      table.integer('filial_id').unsigned().notNullable().references('id').inTable('filials')
      table.timestamps()
    })
  }

  down () {
    this.drop('produtos')
  }
}

module.exports = ProdutoSchema
