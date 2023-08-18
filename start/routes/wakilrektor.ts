import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/mbkm', 'RegistryMBKMController.indexWakilRektor')
  Route.post('/mbkm/post', 'RegistryMBKMController.setujuiMBKM').as('mbkm.setujuiMBKM')
  Route.get('/mbkm/:nim/:pid', 'RegistryMBKMController.checkPendaftar')
  Route.get('/nilai', 'NilaiController.indexAll')
  Route.get('/nilai/:pid', 'NilaiController.indexAllNIM')
}).prefix('/wakilrektor').middleware('auth')
