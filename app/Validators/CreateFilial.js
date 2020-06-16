'use strict'

class CreateFilial {
  get rules () {
    var filial_id = this.ctx.params.filial_id;

    return {
      'nome': 'required|max:80',
      'cnpj': `required|min:14|max:14|unique:filials,cnpj,id,${filial_id}`,
      'telefone': 'required|max:14',
      'endereco': 'required|max:200'
    }
  }

  get messages() {
    return {
      'nome.required': 'Nome é um campo obrigatório',
      'nome.max': 'Nome deve ter no máximo 80 caracteres',
      'cnpj.required': 'CNPJ é um campo obrigatório',
      'cnpj.min': 'CNPJ deve ter 14 caracteres',
      'cnpj.max': 'CNPJ deve ter 14 caracteres',
      'cnpj.unique': 'CNPJ já existe',
      'telefone.required': 'Telefone é um campo obrigatório',
      'telefone.max': 'Telefone deve ter no máximo 14 caracteres',
      'endereco.required': 'Endereço é um campo obrigatório',
      'endereco.max': 'Endereço deve ter no máximo 200 caracteres'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateFilial
