import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/profile', 'ProfilesController.indexMitra')
  Route.post('/profile', 'ProfilesController.updateMitra').as('profile.updateMitra')
  Route.get('/nilai', 'NilaiController.index')
  Route.get('/nilai/new', 'NilaiController.create')
}).prefix('/mitra').middleware('auth')
