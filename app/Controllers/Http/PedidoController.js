'use strict'

const Pedido = use('App/Models/Pedido');
const TipoPedido = use('App/Models/TipoPedido');
const Mesa = use('App/Models/Mesa');
const StatusPedido = use('App/Models/StatusPedido');
const Database = use('Database');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with pedidos
 */
class PedidoController {
  /**
   * Show a list of all pedidos.
   * GET pedidos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new pedido.
   * GET pedidos/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new pedido.
   * POST pedidos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, params, session }) {
    // Extrai os dados do request
    const data = request.only(['filial_id', 'tipo_id', 'mesa_id', 'enderecoEntrega', 'observacao', 'total']);

    const consumirNoLocal = 1;
    data.mesa_id = data.tipo_id == consumirNoLocal ? data.mesa_id : null;

    const delivery = 3;
    data.enderecoEntrega = data.tipo_id == delivery ? data.enderecoEntrega : null; 

    const statusPedidoNovo = await StatusPedido.findBy('id', 1);//1 - Novo
    data.status_id = statusPedidoNovo.id;

    if (data.mesa_id > 0) {
      var mesa = await Mesa.findBy('id', data.mesa_id);
      if (mesa == null) {
        session.flash({storePedidoError: 'A mesa selecionada não existe mais.'});
        return response.redirect('back');
      }
      const statusOcupada = 2;
      if (mesa.status_id == statusOcupada) {
        session.flash({storePedidoError: 'A mesa selecionada já está ocupada.'});
        return response.redirect('back');
      }

      mesa.status_id = statusOcupada;
      await mesa.save();
    }

    // Cria novo pedido com os dados do request
    await Pedido.create(data);

    if (params.mesaSelecionada > 0) {
      return response.redirect('/mesas');
    } else {
      return response.redirect('/pedidos');
    }
  }

  async pedidosView({ view, auth }) {
    const pedidos = await Pedido
    .query()
    .where('filial_id', auth.user.filial_id)
    .with('tipo')
    .with('status')
    .with('mesa')
    .fetch();

    return view.render('pages.pedidos.pedidos', { pedidos: pedidos.toJSON() });
  }

  async cadastrarPedidoView({ view, auth, params, session, response }) {
    if (params.mesaSelecionadaId > 0) {
      const mesa = await Mesa.findBy('id', params.mesaSelecionadaId);
      if (mesa == null) {
        session.flash({cadastrarPedidoMesaError: 'A mesa selecionada não existe mais.'});
        return response.redirect('back');
      }
      const statusOcupada = 2;
      if (mesa.status_id == statusOcupada) {
        session.flash({cadastrarPedidoMesaError: 'A mesa selecionada já está ocupada.'});
        return response.redirect('back');
      }

      return view.render('pages.pedidos.cadastrarPedidoMesa', { mesaSelecionadaId: mesa.id, mesaSelecionadaNumero: mesa.numero });
    } else {
      const tipos = await TipoPedido.all();
      const mesas = await Mesa
      .query()
      .where('filial_id', auth.user.filial_id)
      .andWhere('status_id', 1)
      .fetch();

      return view.render('pages.pedidos.cadastrarPedido', { tipos: tipos.toJSON(), mesas: mesas.toJSON() });
    }
  }

  async alterarPedidoView({ view, params, session, response, auth }) {
    var pedido = await Pedido.findBy('id', params.pedido_id);
    if (pedido == null) {
      //retorna mensagem de erro para informar não foi encontrado o pedido com o id informado
      session.flash({openToEditPedidoError: 'Não foi encontrado o pedido com o id informado!'})
      return response.redirect('back');
    }

    return view.render('pages.pedidos.alterarPedido', { pedido: pedido.toJSON() });
  }

  /**
   * Display a single pedido.
   * GET pedidos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing pedido.
   * GET pedidos/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update pedido details.
   * PUT or PATCH pedidos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a pedido with id.
   * DELETE pedidos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = PedidoController
