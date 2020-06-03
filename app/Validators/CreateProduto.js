'use strict'

class CreateProduto {
  get rules () {
    return {
      'filial_id': 'required',
      'codigo': 'required|max:10',
      'nome': 'required|max:80',
      'descricao': 'max:200',
      'custo': 'max:10',
      'precoVenda': 'required|max:10'
    }
  }

  get messages() {
    return {
      'required': '{{ field }} é um campo obrigatório',
      'codigo.max': '{{ field }} deve ter no máximo 10 caracteres',
      'nome.max': '{{ field }} deve ter no máximo 80 caracteres',
      'descricao.max': '{{ field }} deve ter no máximo 200 caracteres',
      'custo.max': '{{ field }} deve ter no máximo 10 caracteres',
      'precoVenda.max': '{{ field }} deve ter no máximo 10 caracteres'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateProduto
