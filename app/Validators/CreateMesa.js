'use strict'

const Database = use('Database');

class CreateMesa {
  get rules () {
    var mesa_id = this.ctx.params.mesa_id != null ? this.ctx.params.mesa_id : 0;

    return {
      'filial_id': 'required',
      'numero': `required|uniqueCombination:mesas,numero/filial_id,${mesa_id}`,
      'nome': 'required|max:80',
    }
  }

  get messages() {
    return {
      'required': '{{ field }} é um campo obrigatório',
      'nome.max': '{{ field }} deve ter no máximo 80 caracteres',
      'numero.uniqueCombination': '{{ field }} já existe'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateMesa
