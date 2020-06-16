'use strict'

class CreateDespesa {
  get rules () {
    return {
      'filial_id': 'required',
      'descricao': 'required|max:80',
      'data': 'required',
      'valor': 'required'
    }
  }

  get messages() {
    return {
      'filial_id.required': 'Filial é um campo obrigatório',
      'descricao.required': 'Descrição é um campo obrigatório',
      'descricao.max': 'Descrição deve ter no máximo 80 caracteres',
      'data.required': 'Data é um campo obrigatório',
      'valor.required': 'Valor é um campo obrigatório'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateDespesa
