'use strict'

const Produto = use('App/Models/Produto');
const PedidoProduto = use('App/Models/PedidoProduto');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class ProdutoController {
  
  //MÉTODOS GET
  async cardapioView({ auth, view }) {
    const produtos = await Produto
    .query()
    .where('filial_id', auth.user.filial_id)
    .orderBy('nome', 'asc')
    .fetch();

    return view.render('pages.produtos.cardapio', { produtos: produtos.toJSON() });
  }

  async cadastrarProdutoView({ view }) {
    return view.render('pages.produtos.cadastrarProduto');
  }

  async alterarProdutoView({ params, session, response, view }) {
    var produto = await Produto.findBy('id', params.produto_id);
    if (produto == null) {
      //retorna mensagem de erro para informar que o produto não existe mais
      session.flash({openToEditProdutoError: 'O produto não existe mais!'})
      return response.redirect('/cardapio');
    }

    return view.render('pages.produtos.alterarProduto', { produto: produto.toJSON() });
  }

  //MÉTODOS POST
  async store ({ request, response }) {
    const dados = request.only(['filial_id', 'codigo', 'nome', 'descricao', 'custo', 'precoVenda']);
    dados.custo = dados.custo != null ? dados.custo : 0;
    
    await Produto.create(dados);
    
    return response.redirect('/cardapio');
  }

  //MÉTODOS PUT
  async update ({ params, session, response, request }) {
    const produto = await Produto.find(params.produto_id);
    if (produto == null) {
      //retorna mensagem de erro para informar que o produto não existe mais
      session.flash({updateProdutoError: 'O produto não existe mais!'})
      return response.redirect('/cardapio');
    }
    
    const dados = request.only(['codigo', 'nome', 'descricao', 'custo', 'precoVenda']);
    
    produto.merge(dados);
    await produto.save();
    
    return response.redirect('/cardapio');
  }

  //MÉTODOS DELETE
  async destroy ({ params, session, response }) {
    var produto = await Produto.findBy('id', params.produto_id);
    if (produto == null) {
      //retorna mensagem de erro para informar que o produto não existe mais
      session.flash({deleteProdutoError: 'O produto não existe mais!'});
      return response.redirect('/cardapio');
    }
    
    const pedidosComEsteProduto = await PedidoProduto
    .query()
    .where('produto_id', produto.id)
    .fetch();

    if (pedidosComEsteProduto.rows.length > 0) {
      session.flash({deleteProdutoError: `Não é possível excluir o produto: ${produto.codigo} - ${produto.nome} pois existem pedidos com este produto!`});
      return response.redirect('/cardapio');
    }
    
    await produto.delete();
    
    return response.redirect('/cardapio');
  }
}

module.exports = ProdutoController
