'use strict'

class CreateUser {
  get rules() {
    var usuario_id = this.ctx.params.usuario_id;

    const { alterarSenha } = this.ctx.request.all();
    if(alterarSenha == 'on') {
      return {
        'filial_id': 'required',
        'nome': 'required|max:80',
        'login': `required|max:20|unique:users,login,id,${usuario_id}`,
        'password': 'required|max:20',
        'confirmPassword': 'required|same:password'
      }
    } else {
      return {
        'filial_id': 'required',
        'nome': 'required|max:80',
        'login': `required|max:20|unique:users,login,id,${usuario_id}`
      }
    }
  }

  get messages() {
    return {
      'required': '{{ field }} é um campo obrigatório',
      'unique': '{{ field }} já existe',
      'nome.max': '{{ field }} deve ter no máximo 80 caracteres',
      'login.max': '{{ field }} deve ter no máximo 20 caracteres',
      'password.max': '{{ field }} deve ter no máximo 20 caracteres',
      'confirmPassword.same': 'As senhas não conferem'
    }
  }

  async fails(error) {
    this.ctx.session.withErrors(error)
      .flashAll();

    return this.ctx.response.redirect('back');
  }
}

module.exports = CreateUser