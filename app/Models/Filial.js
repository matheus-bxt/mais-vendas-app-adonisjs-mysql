'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Filial extends Model {
    // usuarios () {
    //     return this.belongsToMany
    //     (
    //       'App/Models/User',
    //       'filial_id',
    //       'user_id',
    //       'id',
    //       'id'
    //     ).pivotTable('usuario_filiais')
    //   }
    posts () {
      return this.hasMany('App/Models/User')
    }
}

module.exports = Filial
