import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/profile', 'ProfilesController.indexMahasiswa')
  Route.post('/profile', 'ProfilesController.updateMahasiswa').as('profile.updateMahasiswa')
  Route.get('/sr', 'SRController.indexMahasiswa')
  Route.post('/sr', 'SRController.storeMahasiswa').as('sr.storeMahasiswa')
  Route.get('/mbkm', 'RegistryMBKMController.indexMahasiswa')
  Route.post('/mbkm', 'RegistryMBKMController.storeMahasiswa').as('mbkm.storeMahasiswa')
}).prefix('/mahasiswa').middleware('auth')
