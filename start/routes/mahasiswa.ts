import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  // ROUTE PROFILE
  Route.get('/profile', 'ProfilesController.indexMahasiswa')
  Route.post('/profile', 'ProfilesController.updateMahasiswa').as('profile.updateMahasiswa')

  // ROUTE SURAT REKOMENDASI
  Route.get('/riwayat', 'RegistryMBKMController.riwayatSR')
  Route.get('/sr/new', 'SRController.indexMahasiswa')
  Route.post('/sr/new', 'SRController.storeMahasiswa').as('sr.storeMahasiswa')

  // ROUTE MBKM
  Route.get('/mbkm', 'RegistryMBKMController.indexMahasiswa')
  Route.post('/mbkm', 'RegistryMBKMController.storeMahasiswa').as('mbkm.storeMahasiswa')

  Route.get('/kegiatan', 'KegiatanController.index')
  Route.get('/kegiatan/new/:id', 'KegiatanController.create')
  Route.post('/kegiatan/new', 'KegiatanController.store').as('kegiatan.store')

}).prefix('/mahasiswa').middleware('auth')
