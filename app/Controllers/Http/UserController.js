'use strict'

const User = use('App/Models/User');
const Filial = use('App/Models/Filial');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class UserController {
  
  //MÉTODOS GET
  async loginView({ view }) {
    const usuarios = await User.all();
    const filiais = await Filial.all();

    return view.render('auth.login', { usuarios: usuarios.toJSON(), filiais: filiais.toJSON() });
  }

  async usuariosView({ view }) {
    const usuarios = await User
    .query()
    .with('filial')
    .fetch();

    return view.render('pages.usuarios.usuarios', { usuarios: usuarios.toJSON() });
  }

  async cadastrarUsuarioView({ view }) {
    const usuarios = await User.all();
    const filiais = await Filial.all();

    return view.render('pages.usuarios.cadastrarUsuario', { usuarios: usuarios.toJSON(), filiais: filiais.toJSON() });
  }

  async alterarUsuarioView({ params, session, response, view }) {
    var usuario = await User.findBy('id', params.usuario_id);
    if (usuario == null) {
      //retorna mensagem de erro para informar que o usuário não existe mais
      session.flash({openToEditUsuarioError: 'O usuário não existe mais!'});
      return response.redirect('/usuarios');
    }

    const filiais = await Filial.all();

    return view.render('pages.usuarios.alterarUsuario', { usuario: usuario.toJSON(), filiais: filiais.toJSON() });
  }

  //MÉTODOS POST
  async store ({ response, request, auth, session }) {
    const usuarios = await User.all();
    if (usuarios.rows.length == 0) {
      return response.redirect('/primeiroUsuario');
    }
    
    const dados = request.only(['nome', 'login', 'password', 'admin', 'filial_id']);
    dados.admin = dados.admin == 'on' ? true : false;
    dados.filial_id = dados.filial_id == null ? auth.user.filial_id : dados.filial_id;

    var usuario = await User.findBy('login', dados.login);
    if (usuario != null) {
      // Retorna mensagem para informar que já existe um usuario com o login informado
      session.flash({storeUserError: 'Já existe um usuário com o login informado!'});
      return response.redirect('/cadastrarUsuario');
    }
    
    await User.create(dados);

    return response.redirect('/usuarios');
  }

  async storeFirst ({ session, response, request }) {
    const usuarios = await User.all();
    if (usuarios.rows.length == 0) {

      const filiais = await Filial.all();
      if (filiais.rows.length == 0) {
        // Retorna mensagem para informar que antes de criar o primeiro usuário do sistema, deve ser criada uma filial.
        session.flash({storeFirstUserWithoutFilialError: 'Antes de criar o primeiro usuário do sistema, deve ser criada a primeira filial!'});
        return response.redirect('/primeiroUsuario');
      }
      
      const dados = request.only(['nome', 'login', 'password', 'admin', 'filial_id']);
      dados.admin = true;
      dados.filial_id = dados.filial_id == null ? filiais.rows[0].id : dados.filial_id;
      
      await User.create(dados);
    } else {
      // Retorna mensagem para informar que o primeiro usuário do sistema já foi criado
      session.flash({storeFirstUserAlreadyBeenCreatedError: 'O primeiro usuário do sistema já foi criado! Para criar novos usuários, faça o login com um usuário administrador.'});
      return response.redirect('/primeiroUsuario');
    }

    return response.redirect('/');
  }

  async login({ request, session, response, auth }) {
    const { login, password, filial } = request.all();
    
    var usuario = await User.findBy('login', login);
    if (usuario != null && usuario.filial_id != filial) {
      session.flash({loginError: 'Usuário não pertence a filial informada!'});
      return response.redirect('/login');
    }

    try {
      await auth.attempt(login, password);
      return response.redirect('/');
    } catch (error) {
      session.flash({loginError: 'Login ou senha inválidos.'});
      return response.redirect('/login');
    }
  }

  //MÉTODOS PUT
  async update ({ params, session, response, request }) {
    const usuario = await User.find(params.usuario_id);
    if (usuario == null) {
      //retorna mensagem de erro para informar que o usuário não existe mais
      session.flash({updateUsuarioError: 'O usuário não existe mais!'})
      return response.redirect('/usuarios');
    }

    var { alterarSenha } = request.all();
    if(alterarSenha == 'on') {
      var dados = request.only(['filial_id', 'nome', 'login', 'password', 'admin']);
    } else {
      var dados = request.only(['filial_id', 'nome', 'login', 'admin']);
    }

    dados.admin = dados.admin == 'on' ? true : false;

    if (dados.admin == false) {
      var outrosUsuariosAdmin = await User
      .query()
      .where('id', '<>', usuario.id)
      .andWhere('admin', true)
      .fetch();

      if (outrosUsuariosAdmin.rows.length == 0) {
        session.flash({updateUsuarioError: 'Não é possível retirar o privilégio de administrador, pois deve existir pelo menos um usuário administrador!'})
        return response.redirect('back');
      }
    }
    
    usuario.merge(dados);
    await usuario.save();
    
    return response.redirect('/usuarios');
  }

  //MÉTODOS DELETE
  async destroy ({ params, session, response, auth }) {
    var usuario = await User.findBy('id', params.usuario_id);
    if (usuario == null) {
      //retorna mensagem de erro para informar que o usuário não existe mais
      session.flash({deleteUsuarioError: 'O usuário não existe mais!'});
      return response.redirect('/usuarios');
    }

    if (usuario.id == auth.user.id) {
      session.flash({deleteUsuarioError: `Não é possível excluir o usuário: ${usuario.login} - ${usuario.nome}, pois você está logado nele!`});
      return response.redirect('/usuarios');
    }

    await usuario.delete();

    return response.redirect('/usuarios');
  }
}

module.exports = UserController
