'use strict'

const Filial = use('App/Models/Filial');

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group('userauth', () => {
    //VIEWS
        Route.on('/').render('inicio');

        //FILIAIS
        Route.get('/filiais', 'FilialController.filiaisView').as('view.filiais').middleware(['admin']);
        Route.get('/cadastrarFilial', 'FilialController.cadastrarFilialView').as('view.cadastrarFilial').middleware(['admin']);
        Route.get('/alterarFilial/:filial_id', 'FilialController.alterarFilialView').as('view.alterarFilial').middleware(['admin']);

        //USUÁRIOS
        Route.get('/usuarios', 'UserController.usuariosView').as('view.usuarios').middleware(['admin']);
        Route.get('/cadastrarUsuario', 'UserController.cadastrarUsuarioView').as('view.cadastrarUsuario').middleware(['admin']);
        Route.get('/alterarUsuario/:usuario_id', 'UserController.alterarUsuarioView').as('view.alterarUsuario').middleware(['admin']);

        //DESPESAS
        Route.get('/despesas', 'DespesaController.despesasView').as('view.despesas').middleware(['admin']);
        Route.get('/cadastrarDespesa', 'DespesaController.cadastrarDespesaView').as('view.cadastrarDespesa').middleware(['admin']);
        Route.get('/alterarDespesa/:despesa_id', 'DespesaController.alterarDespesaView').as('view.alterarDespesa').middleware(['admin']);

        //PRODUTOS
        Route.get('/cardapio', 'ProdutoController.cardapioView').as('view.cardapio').middleware(['admin']);
        Route.get('/cadastrarProduto', 'ProdutoController.cadastrarProdutoView').as('view.cadastrarProduto').middleware(['admin']);
        Route.get('/alterarProduto/:produto_id', 'ProdutoController.alterarProdutoView').as('view.alterarProduto').middleware(['admin']);

        //MESAS
        Route.get('/mesas', 'MesaController.mesasView').as('view.mesas');
        Route.get('/cadastrarMesa', 'MesaController.cadastrarMesaView').as('view.cadastrarMesa');
        Route.get('/alterarMesa/:mesa_id', 'MesaController.alterarMesaView').as('view.alterarMesa').middleware(['admin']);

    //CREATE
        Route.post('/cadastrarFilial', 'FilialController.store').as('store.filial').prefix('api').validator('CreateFilial').middleware(['admin']);
        Route.post('/cadastrarUsuario', 'UserController.store').as('store.usuario').prefix('api').validator('CreateUser').middleware(['admin']);
        Route.post('/cadastrarDespesa', 'DespesaController.store').as('store.despesa').prefix('api').validator('CreateDespesa').middleware(['admin']);
        Route.post('/cadastrarProduto', 'ProdutoController.store').as('store.produto').prefix('api').validator('CreateProduto').middleware(['admin']);
        Route.post('/cadastrarMesa', 'MesaController.store').as('store.mesa').prefix('api').validator('CreateMesa');

    //UPDATE
        Route.put('/alterarFilial/:filial_id', 'FilialController.update').as('update.filial').prefix('api').validator('CreateFilial').middleware(['admin']);
        Route.put('/alterarUsuario/:usuario_id', 'UserController.update').as('update.usuario').prefix('api').validator('CreateUser').middleware(['admin']);
        Route.put('/alterarDespesa/:despesa_id', 'DespesaController.update').as('update.despesa').prefix('api').validator('CreateDespesa').middleware(['admin']);
        Route.put('/alterarProduto/:produto_id', 'ProdutoController.update').as('update.produto').prefix('api').validator('CreateProduto').middleware(['admin']);
        Route.put('/alterarMesa/:mesa_id', 'MesaController.update').as('update.mesa').prefix('api').validator('CreateMesa').middleware(['admin']);

    //LOGOUT
        Route.get('/logout', async ({ auth, response }) => {
            await auth.logout();
            return response.redirect('/');
        }).prefix('api');
}).middleware(['userauth'])

Route.group(() => {
    //CREATE PRIMEIRO ACESSO AO SISTEMA
    Route.post('/login', 'UserController.login').validator('LoginUser');
    Route.post('/cadastrarPrimeiraFilial', 'FilialController.storeFirst').as('storeFirst.filial').validator('CreateFilial');
    Route.post('/cadastrarPrimeiroUsuario', 'UserController.storeFirst').as('storeFirst.usuario').validator('CreateUser');
}).prefix('api')

//VIEWS PRIMEIRO ACESSO AO SISTEMA
Route.get('/login', 'UserController.loginView');
Route.get('/primeiraFilial', 'FilialController.cadastrarFilialView');
Route.get('/primeiroUsuario', 'UserController.cadastrarUsuarioView');