'use strict'

const Mesa = use('App/Models/Mesa');
const Database = use('Database');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with mesas
 */
class MesaController {
  /**
   * Show a list of all mesas.
   * GET mesas
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new mesa.
   * GET mesas/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new mesa.
   * POST mesas
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    // Extrai os dados do request
    const data = request.only(['filial_id', 'numero', 'nome', 'status_id']);
    data.status_id = data.status_id != null ? data.status_id : 1;

    // Cria nova mesa com os dados do request
    await Mesa.create(data);    
    return response.redirect('/mesas');
  }

  async mesasView({ view, auth }) {
    const mesas = await Mesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .with('status')
    .fetch();

    return view.render('pages.mesas.mesas', { mesas: mesas.toJSON() });
  }

  async cadastrarMesaView({ view, auth }) {
    var maxNumero = await Database
    .from('mesas')
    .where('filial_id', auth.user.filial_id)
    .getMax('numero');
    maxNumero = maxNumero != null ? maxNumero : 0;

    return view.render('pages.mesas.cadastrarMesa', { nextNumero: maxNumero + 1 });
  }

  async alterarMesaView({ view, params, session, response, auth }) {
    var mesa = await Mesa.findBy('id', params.mesa_id);
    if (mesa == null) {
      //retorna mensagem de erro para informar não foi encontrada a mesa com o id informado
      session.flash({openToEditMesaError: 'Não foi encontrada a mesa com o id informado!'})
      return response.redirect('back');
    }

    return view.render('pages.mesas.alterarMesa', { mesa: mesa.toJSON() });
  }

  /**
   * Display a single mesa.
   * GET mesas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing mesa.
   * GET mesas/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update mesa details.
   * PUT or PATCH mesas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    // Busca a mesa cadastrada com o parametro mesa_id
    const mesa = await Mesa.find(params.mesa_id);

    // Extrai os dados do request
    const data = request.only(['numero', 'nome']);
    
    // Atualiza e salva a mesa
    mesa.merge(data);
    await mesa.save();
    
    return response.redirect('/mesas');
  }

  /**
   * Delete a mesa with id.
   * DELETE mesas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = MesaController
