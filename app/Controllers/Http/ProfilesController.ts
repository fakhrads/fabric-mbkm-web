import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileMahasiswa from '../../Models/ProfileMahasiswa'
import ProfileMitra from '../../Models/ProfileMitra'

export default class ProfilesController {
  public async indexMahasiswa({ view, auth }: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const d = await ProfileMahasiswa.findByOrFail('user_id', auth.user!.id)
      return view.render('pages/profiles/mahasiswa', { data: d })
    } catch (e) {
      return view.render('pages/profiles/mahasiswa', { data: {} })
    }
  }

  public async indexMitra({ view, auth }: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const d = await ProfileMitra.findByOrFail('user_id', auth.user!.id)
      return view.render('pages/profiles/mitra', { data: d })
    } catch (e) {
      return view.render('pages/profiles/mitra', { data: {} })
    }
  }

  public async updateMahasiswa({ request, auth, response, session }: HttpContextContract) {
    await auth.use('web').authenticate()
    const nama = request.input('nama_lengkap')
    const nim = request.input('nim')
    const fakultas = request.input('fakultas')
    const prodi = request.input('program_studi')
    const ipk = request.input('ipk')
    const tanggal_lahir = request.input('tanggal_lahir')
    const jumlah_sks = request.input('jumlah_sks')

    console.log(nama, nim, fakultas, prodi, ipk)
    try {
      const d = await ProfileMahasiswa.findByOrFail('user_id', auth.user!.id)
      d.nama_lengkap = nama
      d.nim = nim
      d.fakultas = fakultas
      d.program_studi = prodi
      d.ipk = ipk
      d.tanggal_lahir = tanggal_lahir
      d.jumlah_sks = jumlah_sks
      await d.save()
      session.flash('success', 'Telah berhasil Menyimpan Data Profil')
      return response.redirect().back()
    } catch(e) {
      if(e.message === 'E_ROW_NOT_FOUND: Row not found') {
        console.log('jancuk')
        try {
          await ProfileMahasiswa.create({
            nama_lengkap: nama,
            nim: nim,
            fakultas: fakultas,
            program_studi: prodi,
            tanggal_lahir: tanggal_lahir,
            ipk: ipk,
            jumlah_sks: jumlah_sks,
            user_id: auth.user!.id
          })
          session.flash('success', 'Telah berhasil Menyimpan Data Profil')
          return response.redirect().back()
        } catch(e) {
          session.flash('error', 'Gagal Menyimpan Data Profil : ' + e.message)
          return response.redirect().back()
        }
      } else {
        session.flash('error', 'Gagal Menyimpan Data Profil : ' + e.message)
        return response.redirect().back()
      }
    }

  }

  public async updateMitra({ request, auth, response, session }: HttpContextContract) {
    await auth.use('web').authenticate()
    const kode_mitra = request.input('kode_mitra')
    const nama_mitra = request.input('nama_mitra')
    const lokasi_mitra = request.input('lokasi_mitra')
    const deskripsi_mitra = request.input('deskripsi_mitra')

    try {
      const d = await ProfileMitra.findByOrFail('user_id', auth.user!.id)
      d.nama_mitra = nama_mitra
      d.lokasi_mitra = lokasi_mitra
      d.deskripsi_mitra = deskripsi_mitra
      d.kode_mitra = kode_mitra
      await d.save()
      session.flash('success', 'Telah berhasil Menyimpan Data Profil Mitra')
      return response.redirect().back()
    } catch(e) {
      if(e.message === 'E_ROW_NOT_FOUND: Row not found') {
        console.log('jancuk')
        try {
          await ProfileMitra.create({
            nama_mitra: nama_mitra,
            lokasi_mitra: lokasi_mitra,
            deskripsi_mitra: deskripsi_mitra,
            kode_mitra: kode_mitra,
            user_id: auth.user!.id
          })
          session.flash('success', 'Telah berhasil Menyimpan Data Profil Mitra')
          return response.redirect().back()
        } catch(e) {
          session.flash('error', 'Gagal Menyimpan Data Profil : ' + e.message)
          return response.redirect().back()
        }
      } else {
        session.flash('error', 'Gagal Menyimpan Data Profil : ' + e.message)
        return response.redirect().back()
      }
    }

  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
