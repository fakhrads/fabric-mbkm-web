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
    const nik = request.input('nik')
    const telepon = request.input('telepon')
    const nama_wali = request.input('nama_wali')
    const kota_domisili = request.input('kota_domisili')
    const provinsi_domisili = request.input('provinsi_domisili')
    const fakultas = request.input('fakultas')
    const prodi = request.input('program_studi')
    const jenjang = request.input('jenjang')
    const ipk = request.input('ipk')
    const tanggal_lahir = request.input('tanggal_lahir')
    const tempat_lahir = request.input('tempat_lahir')
    const jumlah_sks = request.input('jumlah_sks')
    const semester = request.input('semester')
    const beasiswa = request.input('beasiswa')
    const jumlah_beasiswa = request.input('jumlah_beasiswa')


    const transkrip = request.file('transkrip',{
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg', 'pdf'],
    })
    console.log(transkrip)

    if (transkrip) {
      await transkrip.moveToDisk('./')
    }
    
    const fileName: any = transkrip?.fileName 

    console.log(nama, nim, fakultas, prodi, ipk, tanggal_lahir, jumlah_sks, semester, fileName)
    try {
      const d = await ProfileMahasiswa.findByOrFail('user_id', auth.user!.id)
      d.nama_lengkap = nama
      d.nim = nim
      d.nik = nik
      d.telepon = telepon
      d.nama_wali = nama_wali
      d.kota_domisili = kota_domisili
      d.provinsi_domisili = provinsi_domisili
      d.jenjang = jenjang
      d.tempat_lahir = tempat_lahir
      d.beasiswa = beasiswa
      d.jumlah_beasiswa = jumlah_beasiswa
      d.fakultas = fakultas
      d.program_studi = prodi
      d.ipk = ipk
      d.tanggal_lahir = tanggal_lahir
      d.jumlah_sks = jumlah_sks
      d.semester = semester
      d.transkrip = fileName
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
            nik: nik,
            telepon: telepon,
            nama_wali: nama_wali,
            kota_domisili: kota_domisili,
            provinsi_domisili: provinsi_domisili,
            jenjang: jenjang,
            tempat_lahir: tempat_lahir,
            beasiswa: beasiswa,
            jumlah_beasiswa: jumlah_beasiswa,
            program_studi: prodi,
            tanggal_lahir: tanggal_lahir,
            ipk: ipk,
            jumlah_sks: jumlah_sks,
            semester: semester,
            transkrip: fileName,
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
}
