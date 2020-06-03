'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MesaSchema extends Schema {
  up () {
    this.create('mesas', (table) => {
      table.increments()
      table.integer('numero').notNullable()
      table.string('nome', 80).notNullable()
      table.integer('filial_id').unsigned().notNullable().references('id').inTable('filials')
      table.integer('status_id').unsigned().notNullable().references('id').inTable('status_mesas')
      table.unique(['numero', 'filial_id'])
      table.timestamps()
    })
  }

  down () {
    this.drop('mesas')
  }
}

module.exports = MesaSchema
