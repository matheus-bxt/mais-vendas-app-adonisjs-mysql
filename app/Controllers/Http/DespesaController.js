'use strict'

const Despesa = use('App/Models/Despesa');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with despesas
 */
class DespesaController {
  /**
   * Show a list of all despesas.
   * GET despesas
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new despesa.
   * GET despesas/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new despesa.
   * POST despesas
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    // Extrai os dados do request
    const data = request.only(['filial_id', 'descricao', 'data', 'valor']);

    // Cria nova despesa com os dados do request
    await Despesa.create(data);    
    return response.redirect('/despesas');
  }

  async despesasView({ view, auth }) {
    const despesas = await Despesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .fetch();

    return view.render('pages.despesas.despesas', { despesas: despesas.toJSON() });
  }

  async cadastrarDespesaView({ view }) {
    return view.render('pages.despesas.cadastrarDespesa');
  }

  async alterarDespesaView({ view, params, session, response }) {
    var despesa = await Despesa.findBy('id', params.despesa_id);
    if (despesa == null) {
      //retorna mensagem de erro para informar não foi encontrada a despesa com o id informado
      session.flash({openToEditDespesaError: 'Não foi encontrada a despesa com o id informado!'})
      return response.redirect('back');
    }

    return view.render('pages.despesas.alterarDespesa', { despesa: despesa.toJSON() });
  }

  /**
   * Display a single despesa.
   * GET despesas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing despesa.
   * GET despesas/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update despesa details.
   * PUT or PATCH despesas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    // Busca a despesa cadastrada com o parametro despesa_id
    const despesa = await Despesa.find(params.despesa_id);

    // Extrai os dados do request
    const data = request.only(['descricao', 'data', 'valor']);
    
    // Atualiza e salva a despesa
    despesa.merge(data);
    await despesa.save();
    
    return response.redirect('/despesas');
  }

  /**
   * Delete a despesa with id.
   * DELETE despesas/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = DespesaController
