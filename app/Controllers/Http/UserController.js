'use strict'

const User = use('App/Models/User');
const Filial = use('App/Models/Filial');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new user.
   * GET users/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, auth, response, session }) {
    const users = await User.all();
    // Caso ainda não exista nenhum usuário, redireciona para a rota /primeiroUsuario para cadastrar o primeiro usuário
    if (users.rows.length == 0) {
      return response.redirect('/primeiroUsuario');
    }

    // Extrai os dados do request
    const data = request.only(['nome', 'login', 'password', 'admin', 'filial_id']);
    data.admin = data.admin == 'on' ? true : false;
    data.filial_id = data.filial_id == null ? auth.user.filial_id : data.filial_id;

    // Verifica se já existe um usuario com o login informado
    var user = await User.findBy('login', data.login);
    if (user != null) {
      // Retorna mensagem para informar que já existe um usuario com o login informado
      session.flash({storeUserError: 'Já existe um usuário com o login informado!'});
      return response.redirect('/cadastrarUsuario');
    }

    // Cria novo usuário com os dados do request
    await User.create(data);
    return response.redirect('/usuarios');
  }

  async storeFirst ({ request, response, session }) {
    // Busca todos os usuarios cadastrados
    const users = await User.all();
    if (users.rows.length == 0) {

      const filiais = await Filial.all();
      if (filiais.rows.length == 0) {
        // Retorna mensagem para informar que antes de criar o primeiro usuário do sistema, deve ser criada uma filial.
        session.flash({storeFirstUserWithoutFilialError: 'Antes de criar o primeiro usuário do sistema, deve ser criada a primeira filial!'});
        return response.redirect('/primeiroUsuario');
      }

      // Extrai os dados do request
      const data = request.only(['nome', 'login', 'password', 'admin', 'filial_id']);
      data.admin = true;
      data.filial_id = data.filial_id == null ? filiais.rows[0].id : data.filial_id;

      // Cria novo usuario com os dados do request
      await User.create(data);
    } else {
      // Retorna mensagem para informar que o primeiro usuário do sistema já foi criado
      session.flash({storeFirstUserAlreadyBeenCreatedError: 'O primeiro usuário do sistema já foi criado! Para criar novos usuários, faça o login com um usuário administrador.'});
      return response.redirect('/primeiroUsuario');
    }

    return response.redirect('/');
  }

  async login({ request, auth, response, session }) {
    const { login, password, filial } = request.all();
    
    // Verifica se existe um usuário com o login informado e se o usuário pertence a filial informada
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

    const filiais = await Filial.all();
    return view.render('pages.usuarios.usuarios', { usuarios: usuarios.toJSON(), filiais: filiais.toJSON() });
  }

  async cadastrarUsuarioView({ view }) {
    const usuarios = await User.all();
    const filiais = await Filial.all();
    return view.render('pages.usuarios.cadastrarUsuario', { usuarios: usuarios.toJSON(), filiais: filiais.toJSON() });
  }

  async alterarUsuarioView({ view, params, session, response }) {
    var usuario = await User.findBy('id', params.usuario_id);
    if (usuario == null) {
      //retorna mensagem de erro para informar não foi encontrado o usuário com o id informado
      session.flash({openToEditUsuarioError: 'Não foi encontrado o usuário com o id informado!'});
      return response.redirect('back');
    }

    const filiais = await Filial.all();

    return view.render('pages.usuarios.alterarUsuario', { usuario: usuario.toJSON(), filiais: filiais.toJSON() });
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
    // Busca o usuario cadastrado com o parametro id
    const user = await User.find(params.id);

    // Verifica se o usuario existe
    if(user == null) {
      // Retorna mensagem no response para informar que o usuario informado não existe
      response.status(404).send({error:{ message: 'Usuário informado não existe!' }});
      return response;
    }

    // Retorna o usuario cadastrado
    return user;
  }

  async showAll ({ request, response, view }) {
    // Busca todos os usuarios cadastrados
    const users = await User.all();

    // Retorna todos os usuarios cadastrados em formato json
    return users.toJSON();
  }

  /**
   * Render a form to update an existing user.
   * GET users/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    // Busca usuário cadastrado com o parametro usuario_id
    const usuario = await User.find(params.usuario_id);

    var { alterarSenha } = request.all();
    if(alterarSenha == 'on') {
      // Extrai os dados do request
      var data = request.only(['filial_id', 'nome', 'login', 'password', 'admin']);
    } else {
      var data = request.only(['filial_id', 'nome', 'login', 'admin']);
    }

    data.admin = data.admin == 'on' ? true : false;

    // Atualiza e salva o usuário
    usuario.merge(data);
    await usuario.save();
    
    return response.redirect('/usuarios');
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response, session, auth }) {
    var usuario = await User.findBy('id', params.usuario_id);
    if (usuario == null) {
      //retorna mensagem de erro para informar não foi encontrado o usuário com o id informado
      session.flash({deleteUsuarioError: 'Não foi encontrado o usuário com o id informado!'});
      return response.redirect('back');
    }

    if (usuario.id == auth.user.id) {
      session.flash({deleteUsuarioError: `Não é possível excluir o usuário: ${usuario.id} - ${usuario.nome}, pois você está logado nele!`});
      return response.redirect('back');
    }

    await usuario.delete();

    return response.redirect('/usuarios');
  }
}

module.exports = UserController
