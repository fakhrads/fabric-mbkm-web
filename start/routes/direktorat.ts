import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/nilai', 'NilaiController.indexAll')
  Route.get('/nilai/:pid', 'NilaiController.indexAllNIM')
}).prefix('/direktorat').middleware('auth')
