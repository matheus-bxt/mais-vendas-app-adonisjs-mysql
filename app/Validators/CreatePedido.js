'use strict'

class CreatePedido {
  get rules () {
    if(this.ctx.params.mesaSelecionadaId > 0) {
      return {
        'filial_id': 'required',
        'tipo_id': 'required',
        'mesa_id': 'required',
        'observacao': 'max:200',
        'total': 'required'
      }
    } else {
      const { tipo_id } = this.ctx.request.all();
      //3 - Delivery
      if(tipo_id == 3) {
        return {
          'filial_id': 'required',
          'tipo_id': 'required',
          'enderecoEntrega': 'required|max:200',
          'observacao': 'max:200',
          'total': 'required'
        }
      } else {
        return {
          'filial_id': 'required',
          'tipo_id': 'required',
          'observacao': 'max:200',
          'total': 'required'
        }
      }
    }
  }

  get messages() {
    return {
      'required': '{{ field }} é um campo obrigatório',
      'observacao.max': '{{ field }} deve ter no máximo 200 caracteres',
      'enderecoEntrega.max': '{{ field }} deve ter no máximo 200 caracteres'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreatePedido
