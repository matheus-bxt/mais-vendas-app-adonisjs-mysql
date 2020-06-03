'use strict'

const Filial = use('App/Models/Filial');
const User = use('App/Models/User');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with filials
 */
class FilialController {
  /**
   * Show a list of all filials.
   * GET filials
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new filial.
   * GET filials/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new filial.
   * POST filials
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, auth, response, session }) {
    // Caso ainda não exista nenhuma filial, redireciona para a rota /primeiraFilial para cadastrar a primeira filial
    const filiais = await Filial.all();
    if (filiais.rows.length == 0) {
      return response.redirect('/primeiraFilial');
    }

    // Extrai os dados do request
    const data = request.only(['nome', 'cnpj', 'telefone', 'endereco']);

    // Verifica se já existe uma filial com o cnpj informado
    var filial = await Filial.findBy('cnpj', data.cnpj);
    if (filial != null) {
      // Retorna mensagem para informar que já existe uma filial com o cnpj informado
      session.flash({storeFilialError: 'Já existe uma filial com o CNPJ informado!'})
      return response.redirect('/cadastrarFilial');
    }

    // Cria nova filial com os dados do request
    await Filial.create(data);    
    return response.redirect('/filiais');
  }

  async storeFirst({ request, response, session }) {
    // Busca todas as filiais cadastradas
    const filiais = await Filial.all();
    if (filiais.rows.length == 0) {
      // Extrai os dados do request e cria nova filial
      const data = request.only(['nome', 'cnpj', 'telefone', 'endereco']);
      await Filial.create(data);
    } else {
      // Retorna mensagem para informar que a primeira filial do sistema já foi criada
      session.flash({storeFirstFilialAlreadyBeenCreatedError: 'A primeira filial do sistema já foi criada! Para criar novas filiais, faça o login com um usuário administrador.'});
      return response.redirect('/primeiraFilial');
    }
    
    return response.redirect('/');
  }

  async filiaisView({ view }) {
    const usuarios = await User.all();
    const filiais = await Filial.all();
    return view.render('pages.filiais.filiais', { usuarios: usuarios.toJSON(), filiais: filiais.toJSON() });
  }

  async cadastrarFilialView({ view }) {
    const filiais = await Filial.all();
    return view.render('pages.filiais.cadastrarFilial', { filiais: filiais.toJSON() });
  }

  async alterarFilialView({ view, params }) {
    if(params.filial_id != null && params.filial_id > 0) {
      var filial = await Filial.findBy('id', params.filial_id);
      if (filial == null) {
        //retorna mensagem de erro para informar não foi encontrada a filial com o id informado
      }

      return view.render('pages.filiais.alterarFilial', { filial: filial.toJSON() });
    } else {
      //retorna mensagem de erro
    }
  }

  /**
   * Display a single filial.
   * GET filials/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
    // Busca a filial cadastrada com o parametro id
    const filial = await Filial.find(params.id);

    // Verifica se a filial existe
    if(filial == null) {
      // Retorna mensagem no response para informar que a filial informada não existe
      response.status(404).send({error:{ message: 'Filial informada não existe!' }});
      return response;
    }

    // Retorna a filial cadastrada
    return filial;
  }

  async showAll ({ request, response, view }) {
    // Busca todas as filiais cadastradas
    const filiais = await Filial.all();

    // Retorna todas as filiais cadastradas em formato json
    return filiais.toJSON();
  }

  /**
   * Render a form to update an existing filial.
   * GET filials/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update filial details.
   * PUT or PATCH filials/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    // Busca a filial cadastrada com o parametro filial_id
    const filial = await Filial.find(params.filial_id);

    // Extrai os dados do request
    const data = request.only(['nome', 'cnpj', 'telefone', 'endereco']);
    
    // Atualiza e salva a filial
    filial.merge(data);
    await filial.save();
    
    return response.redirect('/filiais');
  }

  /**
   * Delete a filial with id.
   * DELETE filials/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = FilialController
