'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('nome', 80).notNullable()
      table.string('login', 20).notNullable().unique()
      table.string('password', 60).notNullable()
      table.boolean('admin').notNullable().defaultTo(false)
      table.integer('filial_id').unsigned().notNullable().references('id').inTable('filials')
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
