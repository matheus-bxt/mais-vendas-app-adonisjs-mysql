'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StatusMesaSchema extends Schema {
  up () {
    this.create('status_mesas', (table) => {
      table.integer('id').primary()
      table.string('nome', 40).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('status_mesas')
  }
}

module.exports = StatusMesaSchema
