'use strict'

const Despesa = use('App/Models/Despesa');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class DespesaController {

  //MÉTODOS GET
  async despesasView({ auth, view }) {
    const despesas = await Despesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .orderBy('data', 'desc')
    .orderBy('id', 'desc')
    .fetch();

    return view.render('pages.despesas.despesas', { despesas: despesas.toJSON() });
  }

  async cadastrarDespesaView({ view }) {
    return view.render('pages.despesas.cadastrarDespesa');
  }

  async alterarDespesaView({ params, session, response, view }) {
    var despesa = await Despesa.findBy('id', params.despesa_id);
    if (despesa == null) {
      //retorna mensagem de erro para informar que a despesa não existe mais
      session.flash({openToEditDespesaError: 'A despesa não existe mais!'})
      return response.redirect('/despesas');
    }

    return view.render('pages.despesas.alterarDespesa', { despesa: despesa.toJSON() });
  }

  async relatorioDespesasView ({ request, auth, view }) {
    const { data_inicial, data_final} = request.all();
    
    const despesas = await Despesa
    .query()
    .where('filial_id', auth.user.filial_id)
    .andWhere('data', '>=', data_inicial)
    .andWhere('data', '<=', data_final)
    .orderBy('data', 'asc')
    .orderBy('id', 'asc')
    .fetch();

    const valorTotalDespesas = despesas.toJSON().reduce((a, { valor }) => a + (valor), 0);
    const dt_inicial = await this.formataData(data_inicial);
    const dt_final = await this.formataData(data_final);

    return view.render('pages.despesas.relatorioDespesas', { data_inicial: dt_inicial, data_final: dt_final, despesas: despesas.toJSON(), valorTotalDespesas: valorTotalDespesas })
  }

  //MÉTODOS POST
  async store ({ request, response }) {
    const dados = request.only(['filial_id', 'descricao', 'data', 'valor']);

    await Despesa.create(dados);    
    return response.redirect('/despesas');
  }

  //MÉTODOS PUT  
  async update ({ params, request, response, session }) {
    const despesa = await Despesa.find(params.despesa_id);
    if (despesa == null) {
      //retorna mensagem de erro para informar que a despesa não existe mais
      session.flash({updateDespesaError: 'A despesa não existe mais!'})
      return response.redirect('/despesas');
    }

    const dados = request.only(['descricao', 'data', 'valor']);

    despesa.merge(dados);
    await despesa.save();
    
    return response.redirect('/despesas');
  }
  
  //MÉTODOS DELETE
  async destroy ({ params, request, response, session }) {
    var despesa = await Despesa.findBy('id', params.despesa_id);
    if (despesa == null) {
      //retorna mensagem de erro para informar que a despesa não existe mais
      session.flash({deleteDespesaError: 'A despesa não existe mais!'});
      return response.redirect('/despesas');
    }

    await despesa.delete();

    return response.redirect('/despesas');
  }

  //OUTROS MÉTODOS
  async formataData(data) {
    var split = data.split('-');
    return split[2] + '/' + split[1] + '/' + split[0];
  }
}

module.exports = DespesaController
