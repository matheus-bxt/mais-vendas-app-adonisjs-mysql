'use strict'

class CreateDespesa {
  get rules () {
    return {
      'filial_id': 'required',
      'descricao': 'required|max:80',
      'data': 'required|max:10',
      'valor': 'required|max:10'
    }
  }

  get messages() {
    return {
      'required': '{{ field }} é um campo obrigatório',      
      'descricao.max': '{{ field }} deve ter no máximo 80 caracteres',
      'data.max': '{{ field }} deve ter no máximo 10 caracteres',
      'valor.max': '{{ field }} deve ter no máximo 10 caracteres'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateDespesa
