'use strict'

class CreateUser {
  get rules () {
    return {
      'filial': 'required',
      'login': 'required',
      'password': 'required'
    }
  }

  get messages() {
    return {
      'filial.required': 'Filial é um campo obrigatório.',
      'login.required': 'Login é um campo obrigatório.',
      'password.required': 'Senha é um campo obrigatório.'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateUser