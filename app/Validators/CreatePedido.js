'use strict'

class CreatePedido {
  get rules () {
    const { tipo_id } = this.ctx.request.all();
    const consumirNoLocal = 1;
    const delivery = 3;

    if (tipo_id == consumirNoLocal) {
      return {
        'filial_id': 'required',
        'tipo_id': 'required',
        'mesa_id': 'required',
        'observacao': 'max:200',
        'total': 'required'
      }
    } else if (tipo_id == delivery) {
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

  get messages() {
    return {
      'filial_id.required': 'Filial é um campo obrigatório',
      'tipo_id.required': 'Tipo é um campo obrigatório',
      'mesa_id.required': 'Mesa é um campo obrigatório',
      'enderecoEntrega.required': 'Endereço de Entrega é um campo obrigatório',
      'enderecoEntrega.max': 'Endereço de Entrega deve ter no máximo 200 caracteres',
      'observacao.max': 'Observação deve ter no máximo 200 caracteres',
      'total.required': 'Total é um campo obrigatório'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreatePedido
