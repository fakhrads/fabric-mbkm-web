import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/mitra', 'MitraController.index')
  Route.get('/mitra/new', 'MitraController.create').as('pic.mitra.new')
  Route.post('/mitra/new', 'MitraController.store').as('pic.mitra.store')
  Route.get('/mitra/edit/:id', 'MitraController.show')
  Route.post('/mitra/delete', 'MitraController.destroy').as('pic.mitra.delete')
  Route.post('/mitra/password', 'MitraController.updatePassword').as('pic.mitra.password')
  Route.post('/mitra/updatemitra', 'MitraController.updateMitra').as('pic.mitra.updateMitra')
  Route.get('/kegiatan', 'KegiatanController.indexPIC')

  Route.get('/pendaftaran', 'RegistryMBKMController.indexPIC')
}).prefix('/pic').middleware('auth')
