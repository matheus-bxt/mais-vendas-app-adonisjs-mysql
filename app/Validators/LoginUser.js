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
      'required': '{{ field }} é um campo obrigatório.',
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateUser