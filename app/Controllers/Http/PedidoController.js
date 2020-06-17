'use strict'

const Pedido = use('App/Models/Pedido');
const TipoPedido = use('App/Models/TipoPedido');
const Mesa = use('App/Models/Mesa');
const StatusPedido = use('App/Models/StatusPedido');
const Produto = use('App/Models/Produto');
const PedidoProduto = use('App/Models/PedidoProduto');

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
  async store ({ request, response, params, session, view }) {
    // Extrai os dados do request
    const dados = request.only(['filial_id', 'tipo_id', 'mesa_id', 'enderecoEntrega', 'observacao', 'total']);

    const consumirNoLocal = 1;
    dados.mesa_id = dados.tipo_id == consumirNoLocal ? dados.mesa_id : null;

    const delivery = 3;
    dados.enderecoEntrega = dados.tipo_id == delivery ? dados.enderecoEntrega : null;

    const statusPedidoNovo = await StatusPedido.findBy('id', 1);//1 - Novo
    dados.status_id = statusPedidoNovo.id;

    var retorno = await this.atualizaStatusMesa(0, dados.mesa_id, session, response);
    if (retorno == false) {
      return response.redirect('back');
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    dados.data = today;

    // Cria novo pedido com os dados do request
    const novoPedido = await Pedido.create(dados);

    return response.redirect(`/adicionarProdutos/pedido/${novoPedido.id}`, true);
  }

  async pedidosView({ view, auth }) {
    const pedidos = await Pedido
    .query()
    .where('filial_id', auth.user.filial_id)
    .with('tipo')
    .with('status')
    .with('mesa')
    .orderBy('id', 'desc')
    .fetch();

    const statusPedidos = await StatusPedido.all();

    return view.render('pages.pedidos.pedidos', { pedidos: pedidos.toJSON(), statusPedidos: statusPedidos.toJSON() });
  }

  async cadastrarPedidoView({ view, auth, params, session, response }) {
    const tipos = await TipoPedido.all();
    const mesas = await Mesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .andWhere('status_id', 1)
    .fetch();

    return view.render('pages.pedidos.cadastrarPedido', { tipos: tipos.toJSON(), mesas: mesas.toJSON(), mesaSelecionadaId: params.mesaSelecionadaId });
  }

  async alterarPedidoView({ view, params, session, response, auth }) {
    var pedido = await Pedido.findBy('id', params.pedido_id);
    if (pedido == null) {
      //retorna mensagem de erro para informar que o pedido não existe mais
      session.flash({openToEditPedidoError: 'O pedido não existe mais!'})
      return response.redirect('/pedidos');
    }

    const tipos = await TipoPedido.all();
    const statusPedidos = await StatusPedido.all();

    const mesaStatusVazia = 1;
    const mesas = await Mesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .andWhere('status_id', mesaStatusVazia)
    .orWhere('id', pedido.mesa_id)
    .fetch();

    const pedidoProdutos = await PedidoProduto
    .query()
    .where('pedido_id', params.pedido_id)
    .with('pedido')
    .with('produto')
    .fetch();

    const produtos = await Produto
    .query()
    .where('filial_id', auth.user.filial_id)
    .fetch();

    return view.render('pages.pedidos.alterarPedido', { pedido: pedido.toJSON(), tipos: tipos.toJSON(), statusPedidos: statusPedidos.toJSON(), mesas: mesas.toJSON(), pedidoProdutos: pedidoProdutos.toJSON(), produtos: produtos.toJSON() });
  }

  async gerenciarPedidoView({ view, params, session, response, auth }) {
    var mesa = await Mesa.findBy('id', params.mesa_id);
    if (mesa == null) {
      //retorna mensagem de erro para informar que a mesa não existe mais
      session.flash({gerenciarPedidoError: 'A mesa não existe mais!'})
      return response.redirect('/mesas');
    }

    const pedidoStatusPago = 6;
    const pedido = await Pedido
    .query()
    .where('mesa_id', mesa.id)
    .andWhere('status_id', '<>', pedidoStatusPago)
    .fetch();

    if (pedido.rows[0] == null) {
      const mesaStatusVazia = 1;
      mesa.status_id = mesaStatusVazia;
      await mesa.save();

      session.flash({gerenciarPedidoError: 'Não foi encontrado nenhum pedido para esta mesa ou o pedido já foi pago!'})
      return response.redirect('/mesas');
    }

    const pedido_id = pedido.rows[0].id;
    return response.redirect(`/alterarPedido/${pedido_id}`, true);
  }

  async storeProdutoPedido({ request, view, params, session, response, auth }) {
    const dados = request.only(['quantidade', 'precoUnitario', 'observacao', 'pedido_id', 'produto_id']);

    var pedido = await Pedido.findBy('id', dados.pedido_id);
    if (pedido == null) {
      //retorna mensagem de erro para informar que o pedido não existe mais
      session.flash({updatePedidoError: 'O pedido não existe mais!'})
      return response.redirect('/pedidos');
    }

    const pedidoStatusPago = 6;
    if (pedido.status_id == pedidoStatusPago) {
      session.flash({storeProdutoPedidoError: 'Não é possível adicionar produtos em um pedido que já foi pago!'})
      return response.redirect('back');
    }

    await PedidoProduto.create(dados);

    pedido.total = await this.calcularTotalPedido(pedido);
    await pedido.save();

    return response.redirect('back');
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
  async update ({ params, request, response, session }) {
    // Busca o pedido cadastrado com o parametro pedido_id
    const pedido = await Pedido.find(params.pedido_id);
    if (pedido == null) {
      //retorna mensagem de erro para informar que o pedido não existe mais
      session.flash({updatePedidoError: 'O pedido não existe mais!'})
      return response.redirect('/pedidos');
    }

    const pedidoStatusPago = 6;
    if (pedido.status_id == pedidoStatusPago) {
      session.flash({updatePedidoError: 'Não é possível alterar um pedido que já foi pago!'})
      return response.redirect('back');
    }

    // Extrai os dados do request
    var dados = request.only(['tipo_id', 'mesa_id', 'enderecoEntrega', 'observacao', 'status_id']);

    const consumirNoLocal = 1;
    dados.mesa_id = dados.tipo_id == consumirNoLocal ? dados.mesa_id : null;

    const delivery = 3;
    dados.enderecoEntrega = dados.tipo_id == delivery ? dados.enderecoEntrega : null;

    dados.total = await this.calcularTotalPedido(pedido);

    const mesaAnteriorId = pedido.mesa_id != null ? pedido.mesa_id : 0;
    var retorno = await this.atualizaStatusMesa(mesaAnteriorId, dados.mesa_id, session);
    if (retorno == false) {
      return response.redirect('back');
    }

    dados.status_id = dados.status_id != null ? dados.status_id : pedido.status_id;

    if (dados.status_id == pedidoStatusPago) {
      var mesa = await Mesa.findBy('id', dados.mesa_id);      
      if (mesa != null) {
        const mesaStatusVazia = 1;
        mesa.status_id = mesaStatusVazia;
        await mesa.save();
      }
    }

    // Atualiza e salva o pedido
    pedido.merge(dados);
    await pedido.save();
    
    return response.redirect('/pedidos');
  }

  async updateProdutoPedido({ params, request, response, session }) {
    var pedidoProduto = await PedidoProduto.findBy('id', params.id);
    if (pedidoProduto == null) {
      session.flash({updateProdutoPedidoError: 'O produto não existe mais!'});
      return response.redirect('back');
    }

    var pedido = await Pedido.findBy('id', pedidoProduto.pedido_id);

    const pedidoStatusPago = 6;
    if (pedido.status_id == pedidoStatusPago) {
      session.flash({updateProdutoPedidoError: 'Não é possível alterar os produtos de um pedido que já foi pago!'})
      return response.redirect('back');
    }

    // Extrai os dados do request
    const dados = request.only(['produto_id', 'quantidade', 'precoUnitario', 'observacao']);
    
    pedidoProduto.merge(dados);
    await pedidoProduto.save();

    pedido.total = await this.calcularTotalPedido(pedido);
    await pedido.save();
    
    return response.redirect('back');
  }

  async updateStatusPedido({ params, request, response, session }) {
    var pedido = await Pedido.findBy('id', params.pedido_id);
    if (pedido == null) {
      session.flash({updateStatusPedidoError: 'O pedido não existe mais!'});
      return response.redirect('back');
    }

    const pedidoStatusPago = 6;
    if (pedido.status_id == pedidoStatusPago) {
      session.flash({updateStatusPedidoError: 'Não é possível alterar o status de um pedido que já foi pago!'});
      return response.redirect('back');
    }

    const dados = request.only(['status_id']);

    if (pedido.status_id == dados.status_id) {
      return response.redirect('back');
    }

    pedido.status_id = dados.status_id;
    await pedido.save();

    if (pedido.status_id == pedidoStatusPago) {
      var mesa = await Mesa.findBy('id', pedido.mesa_id);
      if (mesa != null) {
        const mesaStatusVazia = 1;
        mesa.status_id = mesaStatusVazia;
        await mesa.save();
      }
    }

    return response.redirect('back');
  }

  async atualizaStatusMesa(mesaAnteriorId, mesaAtualId, session) {
    if (mesaAnteriorId != mesaAtualId) {

      if (mesaAtualId > 0) {
        var mesaAtual = await Mesa.findBy('id', mesaAtualId);
        if (mesaAtual == null) {
          session.flash({updateStatusMesaError: 'A mesa selecionada não existe mais.'});
          return false;
        }

        const statusOcupada = 2;

        // if (mesa.status_id == statusOcupada) {
        //   session.flash({storePedidoError: 'A mesa selecionada já está ocupada.'});
        //   return response.redirect('back');
        // }

        mesaAtual.status_id = statusOcupada;
        await mesaAtual.save();
      }

      var mesaAnterior = await Mesa.findBy('id', mesaAnteriorId);
      if (mesaAnterior != null) {
        const statusVazia = 1;
        mesaAnterior.status_id = statusVazia;
        await mesaAnterior.save();
      }
    }

    return true;
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
    var pedido = await Pedido.findBy('id', params.pedido_id);
    if (pedido == null) {
      //retorna mensagem de erro para informar não foi encontrado o pedido com o id informado
      session.flash({deletePedidoError: 'Não foi encontrado o pedido com o id informado!'})
      return response.redirect('back');
    }
    
    var mesa = await Mesa.findBy('id', pedido.mesa_id);
    if (mesa != null) {
      const statusVazia = 1;
      mesa.status_id = statusVazia;
      await mesa.save();
    }

    await pedido.pedidoProdutos().delete();
    await pedido.delete();

    return response.redirect('/pedidos');
  }

  async destroyProdutoPedido ({ params, request, response, session }) {
    var pedidoProduto = await PedidoProduto.findBy('id', params.id);
    if (pedidoProduto == null) {
      session.flash({deleteProdutoPedidoError: 'O produto não existe mais!'});
      return response.redirect('back');
    }

    var pedido = await Pedido.findBy('id', pedidoProduto.pedido_id);

    const pedidoStatusPago = 6;
    if (pedido.status_id == pedidoStatusPago) {
      session.flash({deleteProdutoPedidoError: 'Não é possível excluir os produtos de um pedido que já foi pago!'})
      return response.redirect('back');
    }

    await pedidoProduto.delete();

    pedido.total = await this.calcularTotalPedido(pedido);
    await pedido.save();

    return response.redirect('back');
  }

  async calcularTotalPedido(pedido) {
    var pedidoProdutos = await pedido.pedidoProdutos().fetch();
    var total = pedidoProdutos.toJSON().reduce((a, { quantidade, precoUnitario }) => a + (quantidade * precoUnitario), 0);

    return total;
  }
}

module.exports = PedidoController
