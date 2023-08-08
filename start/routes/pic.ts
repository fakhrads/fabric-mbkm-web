import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/mitra', 'MitraController.index')
  Route.get('/mitra/new', 'MitraController.create').as('pic.mitra.new')
  Route.post('/mitra/new', 'MitraController.store').as('pic.mitra.store')
}).prefix('/pic').middleware('auth')
