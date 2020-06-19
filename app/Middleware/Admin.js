'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Admin {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, response, session }, next) {
    // call next to advance the request
    if(!auth.user.admin){
      session.flash({adminOnlyError: 'Acesso negado! Somente usuário administrador.'})
      return response.redirect('/')
    }

    await next()
  }
}

module.exports = Admin
