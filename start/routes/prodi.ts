import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/sr', 'SRController.indexProdi')
  Route.post('/sr', 'SRController.setujuiSRP').as('sr.setujuiSRP')

  Route.get('/sr/:nim', 'SRController.checkPendaftar')
}).prefix('/prodi').middleware('auth')
