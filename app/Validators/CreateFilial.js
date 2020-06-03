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
      'required': '{{ field }} é um campo obrigatório',      
      'nome.max': '{{ field }} deve ter no máximo 80 caracteres',
      'cnpj.min': '{{ field }} deve ter 14 caracteres',
      'cnpj.max': '{{ field }} deve ter 14 caracteres',      
      'telefone.max': '{{ field }} deve ter no máximo 14 caracteres',
      'endereco.max': '{{ field }} deve ter no máximo 200 caracteres',
      'unique': '{{ field }} já existe'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateFilial
