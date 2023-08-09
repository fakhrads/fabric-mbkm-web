import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/profile', 'ProfilesController.indexMitra')
  Route.post('/profile', 'ProfilesController.updateMitra').as('profile.updateMitra')
  Route.get('/nilai', 'NilaiController.index')
  Route.get('/nilai/upload/:id', 'NilaiController.create')

  Route.post('/nilai/upload/', 'NilaiController.store').as('nilai.store')
}).prefix('/mitra').middleware('auth')
