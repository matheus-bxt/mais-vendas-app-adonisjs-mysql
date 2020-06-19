'use strict'

const Mesa = use('App/Models/Mesa');
const Pedido = use('App/Models/Pedido');
const Database = use('Database');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class MesaController {

  //MÉTODOS GET
  async mesasView({ auth, view }) {
    const mesas = await Mesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .with('status')
    .fetch();

    return view.render('pages.mesas.mesas', { mesas: mesas.toJSON() });
  }

  async cadastrarMesaView({ auth, view }) {
    var maxNumero = await Database
    .from('mesas')
    .where('filial_id', auth.user.filial_id)
    .getMax('numero');
    maxNumero = maxNumero != null ? maxNumero : 0;

    return view.render('pages.mesas.cadastrarMesa', { nextNumero: maxNumero + 1 });
  }

  async alterarMesaView({ params, session, response, view }) {
    var mesa = await Mesa.findBy('id', params.mesa_id);
    if (mesa == null) {
      //retorna mensagem de erro para informar que a mesa não existe mais
      session.flash({openToEditMesaError: 'A mesa não existe mais!'})
      return response.redirect('/mesas');
    }

    return view.render('pages.mesas.alterarMesa', { mesa: mesa.toJSON() });
  }

  //MÉTODOS POST
  async store ({ request, response }) {
    const dados = request.only(['filial_id', 'numero', 'nome']);

    const mesaStatusVazia = 1;
    dados.status_id = mesaStatusVazia;

    await Mesa.create(dados);
    
    return response.redirect('/mesas');
  }

  //MÉTODOS PUT
  async update ({ params, session, response, request }) {
    const mesa = await Mesa.find(params.mesa_id);
    if (mesa == null) {
      //retorna mensagem de erro para informar que a mesa não existe mais
      session.flash({updateMesaError: 'A mesa não existe mais!'})
      return response.redirect('/mesas');
    }
    
    const dados = request.only(['numero', 'nome']);
    
    mesa.merge(dados);
    await mesa.save();
    
    return response.redirect('/mesas');
  }

  //MÉTODOS DELETE
  async destroy ({ params, session, response }) {
    var mesa = await Mesa.findBy('id', params.mesa_id);
    if (mesa == null) {
      //retorna mensagem de erro para informar que a mesa não existe mais
      session.flash({deleteMesaError: 'A mesa não existe mais!'})
      return response.redirect('/mesas');
    }

    const pedidosDestaMesa = await Pedido
    .query()
    .where('filial_id', mesa.filial_id)
    .andWhere('mesa_id', mesa.id)
    .fetch();

    if (pedidosDestaMesa.rows.length > 0) {
      session.flash({deleteMesaError: `Não é possível excluir a mesa: ${mesa.numero} pois existem pedidos vinculados a ela!`});
      return response.redirect('/mesas');
    }
    
    await mesa.delete();

    return response.redirect('/mesas');
  }
}

module.exports = MesaController
