'use strict'

const Filial = use('App/Models/Filial');
const User = use('App/Models/User');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class FilialController {
  
  //MÉTODOS GET
  async filiaisView({ view }) {
    const filiais = await Filial.all();
    return view.render('pages.filiais.filiais', { filiais: filiais.toJSON() });
  }

  async cadastrarFilialView({ view }) {
    const filiais = await Filial.all();
    return view.render('pages.filiais.cadastrarFilial', { filiais: filiais.toJSON() });
  }

  async alterarFilialView({ params, session, response, view }) {
    var filial = await Filial.findBy('id', params.filial_id);
    if (filial == null) {
      //retorna mensagem de erro para informar que a filial não existe mais
      session.flash({openToEditFilialError: 'A filial não existe mais!'});
      return response.redirect('/filiais');
    }

    return view.render('pages.filiais.alterarFilial', { filial: filial.toJSON() });
  }

  //MÉTODOS POST
  async store ({ response, request, session }) {
    const filiais = await Filial.all();
    if (filiais.rows.length == 0) {
      return response.redirect('/primeiraFilial');
    }
    
    const dados = request.only(['nome', 'cnpj', 'telefone', 'endereco']);

    var filial = await Filial.findBy('cnpj', dados.cnpj);
    if (filial != null) {
      // Retorna mensagem para informar que já existe uma filial com o cnpj informado
      session.flash({storeFilialError: 'Já existe uma filial com o CNPJ informado!'})
      return response.redirect('/cadastrarFilial');
    }

    await Filial.create(dados);

    return response.redirect('/filiais');
  }

  async storeFirst({ request, session, response }) {
    const filiais = await Filial.all();
    if (filiais.rows.length == 0) {
      const dados = request.only(['nome', 'cnpj', 'telefone', 'endereco']);
      await Filial.create(dados);
    } else {
      // Retorna mensagem para informar que a primeira filial do sistema já foi criada
      session.flash({storeFirstFilialAlreadyBeenCreatedError: 'A primeira filial do sistema já foi criada! Para criar novas filiais, faça o login com um usuário administrador.'});
      return response.redirect('/primeiraFilial');
    }

    this.executaScripts();
    
    return response.redirect('/');
  }

  //MÉTODOS PUT
  async update ({ params, session, response, request }) {
    const filial = await Filial.find(params.filial_id);
    if (filial == null) {
      //retorna mensagem de erro para informar que a filial não existe mais
      session.flash({updateFilialError: 'A filial não existe mais!'})
      return response.redirect('/filiais');
    }
    
    const dados = request.only(['nome', 'cnpj', 'telefone', 'endereco']);
    
    filial.merge(dados);
    await filial.save();
    
    return response.redirect('/filiais');
  }

  //MÉTODOS DELETE
  async destroy ({ params, session, response, auth }) {
    var filial = await Filial.findBy('id', params.filial_id);
    if (filial == null) {
      //retorna mensagem de erro para informar que a filial não existe mais
      session.flash({deleteFilialError: 'A filial não existe mais!'});
      return response.redirect('/filiais');
    }

    if (filial.id == auth.user.filial_id) {
      session.flash({deleteFilialError: `Não é possível excluir a filial: ${filial.id} - ${filial.nome}, pois você está logado nela!`});
      return response.redirect('/filiais');
    }

    try {
      await filial.delete();
    } catch (error) {
      session.flash({deleteFilialError: 'Não é possível excluir a filial, pois a mesma já possui vínculos!'});
      return response.redirect('/filiais');
    }

    return response.redirect('/filiais');
  }

  //OUTROS MÉTODOS
  async executaScripts() {
    const Database = use('Database');
    
    await Database.table('status_mesas').insert({ id: 1, nome: 'Vazia' })
    await Database.table('status_mesas').insert({ id: 2, nome: 'Ocupada' })

    await Database.table('status_pedidos').insert({ id: 1, nome: 'Novo' })
    await Database.table('status_pedidos').insert({ id: 2, nome: 'Em preparo' })
    await Database.table('status_pedidos').insert({ id: 3, nome: 'Pronto' })
    await Database.table('status_pedidos').insert({ id: 4, nome: 'Saiu para entrega' })
    await Database.table('status_pedidos').insert({ id: 5, nome: 'Entregue' })
    await Database.table('status_pedidos').insert({ id: 6, nome: 'Pago' })
    
    await Database.table('tipo_pedidos').insert({ id: 1, nome: 'Consumir no local' })
    await Database.table('tipo_pedidos').insert({ id: 2, nome: 'Retirar no balcão' })
    await Database.table('tipo_pedidos').insert({ id: 3, nome: 'Delivery' })
  }
}

module.exports = FilialController
