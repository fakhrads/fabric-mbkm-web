import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/mbkm', 'RegistryMBKMController.indexWakilRektor')
  Route.post('/mbkm/post', 'RegistryMBKMController.setujuiMBKM').as('mbkm.setujuiMBKM')
  Route.get('/mbkm/:nim', 'RegistryMBKMController.checkPendaftar')
}).prefix('/wakilrektor').middleware('auth')
