'use strict'

const Filial = use('App/Models/Filial');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class UserAuth {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, response, view }, next) {
    // call next to advance the request
    if(!auth.user){
      return response.redirect('/login')
    }

    var filial = await Filial.findBy('id', auth.user.filial_id);

    view.share({
      filialLogada: filial
    })

    await next()
  }
}

module.exports = UserAuth
