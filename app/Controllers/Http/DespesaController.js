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
    .orderBy('data', 'desc')
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
  async update ({ params, request, response, session }) {
    // Busca a despesa cadastrada com o parametro despesa_id
    const despesa = await Despesa.find(params.despesa_id);
    if (despesa == null) {
      //retorna mensagem de erro para informar que a despesa não existe mais
      session.flash({updateDespesaError: 'A despesa não existe mais!'})
      return response.redirect('/despesas');
    }

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
  async destroy ({ params, request, response, session }) {
    var despesa = await Despesa.findBy('id', params.despesa_id);
    if (despesa == null) {
      //retorna mensagem de erro para informar não foi encontrada a despesa com o id informado
      session.flash({deleteDespesaError: 'Não foi encontrada a despesa com o id informado!'});
      return response.redirect('back');
    }

    await despesa.delete();

    return response.redirect('/despesas');
  }

  async relatorioDespesasView ({ request, auth, view }) {
    const { data_inicial, data_final} = request.all();
    
    const despesas = await Despesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .andWhere('data', '>=', data_inicial)
    .andWhere('data', '<=', data_final)
    .fetch();

    const valorTotalDespesas = despesas.toJSON().reduce((a, { valor }) => a + (valor), 0);
    const dt_inicial = await this.formataData(data_inicial);
    const dt_final = await this.formataData(data_final);

    return view.render('pages.despesas.relatorioDespesas', { data_inicial: dt_inicial, data_final: dt_final, despesas: despesas.toJSON(), valorTotalDespesas: valorTotalDespesas })
  }

  async formataData(data) {
    var split = data.split('-');
    return split[2] + '/' + split[1] + '/' + split[0];
  }
}

module.exports = DespesaController
