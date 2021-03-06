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

class PedidoController {

  //MÉTODOS GET
  async pedidosView({ auth, view }) {
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

  async cadastrarPedidoView({ auth, view, params }) {
    const tipos = await TipoPedido.all();
    const mesas = await Mesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .andWhere('status_id', 1)
    .fetch();

    return view.render('pages.pedidos.cadastrarPedido', { tipos: tipos.toJSON(), mesas: mesas.toJSON(), mesaSelecionadaId: params.mesaSelecionadaId });
  }

  async alterarPedidoView({ params, session, response, auth, view }) {
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

  async gerenciarPedidoView({ params, session, response }) {
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

  async relatorioPedidosView({ request, auth, view }) {
    const { data_inicial, data_final} = request.all();
    
    const pedidoStatusPago = 6;
    const pedidos = await Pedido
    .query()
    .where('filial_id', auth.user.filial_id)
    .andWhere('data', '>=', data_inicial)
    .andWhere('data', '<=', data_final)
    .andWhere('status_id', pedidoStatusPago)
    .with('tipo')
    .with('mesa')
    .with('pedidoProdutos')
    .with('pedidoProdutos.produto')
    .fetch();

    const valorTotalPedidos = pedidos.toJSON().reduce((a, { total }) => a + (total), 0);
    const dt_inicial = await this.formataData(data_inicial);
    const dt_final = await this.formataData(data_final);

    return view.render('pages.pedidos.relatorioPedidos', { data_inicial: dt_inicial, data_final: dt_final, pedidos: pedidos.toJSON(), valorTotalPedidos: valorTotalPedidos })
  }

  //MÉTODOS POST
  async store ({ request, response, session }) {
    const dados = request.only(['filial_id', 'tipo_id', 'mesa_id', 'enderecoEntrega', 'observacao', 'total']);

    const consumirNoLocal = 1;
    dados.mesa_id = dados.tipo_id == consumirNoLocal ? dados.mesa_id : null;

    const delivery = 3;
    dados.enderecoEntrega = dados.tipo_id == delivery ? dados.enderecoEntrega : null;

    const pedidoStatusNovo = 1;
    dados.status_id = pedidoStatusNovo;

    var retorno = await this.atualizaStatusMesa(0, dados.mesa_id, 0, dados.status_id, session);
    if (retorno == false) {
      return response.redirect('back');
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    dados.data = today;
    
    const novoPedido = await Pedido.create(dados);

    return response.redirect(`/adicionarProdutos/pedido/${novoPedido.id}`, true);
  }
  
  async storeProdutoPedido({ request, session, response }) {
    const dados = request.only(['quantidade', 'precoUnitario', 'observacao', 'pedido_id', 'produto_id']);

    var pedido = await Pedido.findBy('id', dados.pedido_id);
    if (pedido == null) {
      //retorna mensagem de erro para informar que o pedido não existe mais
      session.flash({updatePedidoError: 'O pedido não existe mais!'})
      return response.redirect('/pedidos');
    }

    var produto = await Produto.findBy('id', dados.produto_id);
    if (produto == null) {
      //retorna mensagem de erro para informar que o produto não existe mais
      session.flash({storeProdutoPedidoError: 'O produto não existe mais!'})
      return response.redirect('back');
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

  //MÉTODOS PUT
  async update ({ params, session, response, request }) {
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
    
    var dados = request.only(['tipo_id', 'mesa_id', 'enderecoEntrega', 'observacao', 'status_id']);

    const consumirNoLocal = 1;
    dados.mesa_id = dados.tipo_id == consumirNoLocal ? dados.mesa_id : null;

    const delivery = 3;
    dados.enderecoEntrega = dados.tipo_id == delivery ? dados.enderecoEntrega : null;

    dados.total = await this.calcularTotalPedido(pedido);

    dados.status_id = dados.status_id != null ? dados.status_id : pedido.status_id;

    const mesaAnteriorId = pedido.mesa_id != null ? pedido.mesa_id : 0;
    var retorno = await this.atualizaStatusMesa(mesaAnteriorId, dados.mesa_id, pedido.id, dados.status_id, session);
    if (retorno == false) {
      return response.redirect('back');
    }
    
    pedido.merge(dados);
    await pedido.save();
    
    return response.redirect('/pedidos');
  }

  async updateProdutoPedido({ params, session, response, request }) {
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
    
    const dados = request.only(['produto_id', 'quantidade', 'precoUnitario', 'observacao']);

    var produto = await Produto.findBy('id', dados.produto_id);
    if (produto == null) {
      //retorna mensagem de erro para informar que o produto não existe mais
      session.flash({updateProdutoPedidoError: 'O produto não existe mais!'})
      return response.redirect('back');
    }
    
    pedidoProduto.merge(dados);
    await pedidoProduto.save();

    pedido.total = await this.calcularTotalPedido(pedido);
    await pedido.save();
    
    return response.redirect('back');
  }

  async updateStatusPedido({ params, session, response, request }) {
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

    await this.atualizaStatusMesa(0, pedido.mesa_id, pedido.id, dados.status_id, session);

    pedido.status_id = dados.status_id;
    await pedido.save();

    return response.redirect('back');
  }

  //MÉTODOS DELETE
  async destroy ({ params, session, response }) {
    var pedido = await Pedido.findBy('id', params.pedido_id);
    if (pedido == null) {
      //retorna mensagem de erro para informar que o pedido não existe mais
      session.flash({deletePedidoError: 'O pedido não existe mais!'})
      return response.redirect('back');
    }

    const pedidoStatusPago = 6;
    
    var mesa = await Mesa.findBy('id', pedido.mesa_id);
    if (mesa != null && pedido.status_id != pedidoStatusPago) {
      const statusVazia = 1;
      mesa.status_id = statusVazia;
      await mesa.save();
    }

    await pedido.pedidoProdutos().delete();
    await pedido.delete();

    return response.redirect('/pedidos');
  }

  async destroyProdutoPedido ({ params, session, response }) {
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

  //OUTROS MÉTODOS
  async atualizaStatusMesa(mesaAnteriorId, mesaAtualId, pedidoId, pedidoStatusId, session) {
    const pedidoStatusPago = 6;
    const statusVazia = 1;
    const statusOcupada = 2;

    if (mesaAtualId > 0) {
      var mesaAtual = await Mesa.findBy('id', mesaAtualId);
      if (mesaAtual == null) {
        session.flash({updateStatusMesaError: 'A mesa selecionada não existe mais.'});
        return false;
      }

      var outrosPedidosNaoPagosComMesaAtual = await Pedido
      .query()
      .where('id', '<>', pedidoId)
      .andWhere('status_id', '<>', pedidoStatusPago)
      .andWhere('mesa_id', mesaAtualId)
      .fetch();

      if (outrosPedidosNaoPagosComMesaAtual.rows[0] != null) {
        session.flash({updateStatusMesaError: 'A mesa selecionada já está ocupada.'});
        return false;
      }
      
      mesaAtual.status_id = pedidoStatusId == pedidoStatusPago ? statusVazia : statusOcupada;

      await mesaAtual.save();
    }

    if (mesaAnteriorId != mesaAtualId) {
      var mesaAnterior = await Mesa.findBy('id', mesaAnteriorId);
      if (mesaAnterior != null) {
        mesaAnterior.status_id = statusVazia;
        await mesaAnterior.save();
      }
    }

    return true;
  }

  async calcularTotalPedido(pedido) {
    var pedidoProdutos = await pedido.pedidoProdutos().fetch();
    var total = pedidoProdutos.toJSON().reduce((a, { quantidade, precoUnitario }) => a + (quantidade * precoUnitario), 0);

    return total;
  }

  async formataData(data) {
    var split = data.split('-');
    return split[2] + '/' + split[1] + '/' + split[0];
  }
}

module.exports = PedidoController
