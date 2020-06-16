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
      'filial_id.required': 'Filial é um campo obrigatório',
      'codigo.required': 'Código é um campo obrigatório',
      'codigo.max': 'Código deve ter no máximo 10 caracteres',
      'nome.required': 'Nome é um campo obrigatório',
      'nome.max': 'Nome deve ter no máximo 80 caracteres',
      'descricao.max': 'Descrição deve ter no máximo 200 caracteres',
      'custo.max': 'Custo deve ter no máximo 10 caracteres',
      'precoVenda.required': 'Preço Venda é um campo obrigatório',    
      'precoVenda.max': 'Preço Venda deve ter no máximo 10 caracteres'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateProduto
