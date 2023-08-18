import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/sr', 'SRController.indexProdi')
  Route.post('/sr', 'SRController.setujuiSRP').as('sr.setujuiSRP')

  Route.get('/sr/:nim/:pid', 'SRController.checkPendaftar')
  Route.get('/nilai', 'NilaiController.indexAll')
  Route.get('/nilai/:pid', 'NilaiController.indexAllNIM')
}).prefix('/prodi').middleware('auth')
