'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

// SCRIPT
// CREATE DATABASE maisvendas CHARACTER SET utf8 COLLATE utf8_general_ci;

class FilialSchema extends Schema {
  up () {
    this.create('filials', (table) => {
      table.increments()
      table.string('nome', 80).notNullable()
      table.string('cnpj', 14).notNullable().unique()
      table.string('telefone', 14).notNullable()
      table.string('endereco', 200).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('filials')
  }
}

module.exports = FilialSchema
