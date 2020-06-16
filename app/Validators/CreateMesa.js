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
      'filial_id.required': 'Filial é um campo obrigatório',
      'numero.required': 'Número é um campo obrigatório',
      'numero.uniqueCombination': 'Número já existe',
      'nome.required': 'Nome é um campo obrigatório',
      'nome.max': 'Nome deve ter no máximo 80 caracteres'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateMesa
