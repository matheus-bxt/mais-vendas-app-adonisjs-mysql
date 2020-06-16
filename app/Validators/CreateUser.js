'use strict'

class CreateUser {
  get rules() {
    var usuario_id = this.ctx.params.usuario_id;

    const { alterarSenha } = this.ctx.request.all();
    if(alterarSenha == 'on' || usuario_id == null) {
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
      'filial_id.required': 'Filial é um campo obrigatório',
      'nome.required': 'Nome é um campo obrigatório',
      'nome.max': 'Nome deve ter no máximo 80 caracteres',
      'login.required': 'Login é um campo obrigatório',
      'login.max': 'Login deve ter no máximo 20 caracteres',
      'login.unique': 'Login já existe',
      'password.required': 'Senha é um campo obrigatório',
      'password.max': 'Senha deve ter no máximo 20 caracteres',
      'confirmPassword.required': 'Confirmar Senha é um campo obrigatório',
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