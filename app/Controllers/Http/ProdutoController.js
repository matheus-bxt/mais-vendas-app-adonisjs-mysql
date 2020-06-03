'use strict'

const Produto = use('App/Models/Produto');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with produtos
 */
class ProdutoController {
  /**
   * Show a list of all produtos.
   * GET produtos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new produto.
   * GET produtos/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new produto.
   * POST produtos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    // Extrai os dados do request
    const data = request.only(['filial_id', 'codigo', 'nome', 'descricao', 'custo', 'precoVenda']);
    data.custo = data.custo != null ? data.custo : 0;

    // Cria novo produto com os dados do request
    await Produto.create(data);    
    return response.redirect('/cardapio');
  }

  async cardapioView({ view, auth }) {
    const produtos = await Produto
    .query()
    .where('filial_id', auth.user.filial_id)
    .fetch();

    return view.render('pages.produtos.cardapio', { produtos: produtos.toJSON() });
  }

  async cadastrarProdutoView({ view }) {
    return view.render('pages.produtos.cadastrarProduto');
  }

  async alterarProdutoView({ view, params, session, response }) {
    var produto = await Produto.findBy('id', params.produto_id);
    if (produto == null) {
      //retorna mensagem de erro para informar não foi encontrado o produto com o id informado
      session.flash({openToEditProdutoError: 'Não foi encontrado o produto com o id informado!'})
      return response.redirect('back');
    }

    return view.render('pages.produtos.alterarProduto', { produto: produto.toJSON() });
  }

  /**
   * Display a single produto.
   * GET produtos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing produto.
   * GET produtos/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update produto details.
   * PUT or PATCH produtos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    // Busca o produto cadastrado com o parametro produto_id
    const produto = await Produto.find(params.produto_id);

    // Extrai os dados do request
    const data = request.only(['codigo', 'nome', 'descricao', 'custo', 'precoVenda']);
    
    // Atualiza e salva o produto
    produto.merge(data);
    await produto.save();
    
    return response.redirect('/cardapio');
  }

  /**
   * Delete a produto with id.
   * DELETE produtos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = ProdutoController
