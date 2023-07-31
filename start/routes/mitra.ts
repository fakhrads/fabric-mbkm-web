import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/profile', 'ProfilesController.indexMitra')
  Route.post('/profile', 'ProfilesController.updateMitra').as('profile.updateMitra')
}).prefix('/mitra').middleware('auth')
