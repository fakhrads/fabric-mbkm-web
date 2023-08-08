import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileMahasiswa from '../../Models/ProfileMahasiswa'

const axios = require('axios')
const randomstring = require("randomstring");
export default class KegiatanController {
  public async index({ view, auth, session}: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const data_mahasiswa = await ProfileMahasiswa.query().where('user_id', auth.user!.id).firstOrFail()
      
      const res = await axios.put("http://localhost:3000/evaluate/kegiatan-channel/kegiatan-chaincode/QueryAsset",
        [ data_mahasiswa.nim ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )

      return view.render('pages/mahasiswa/kegiatan', { data: res.data })
    } catch(e) {
      session.flash('error', e.message)
      return view.render('pages/mahasiswa/kegiatan')
    }
  }

  public async create({ view, auth, session }: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const data_mahasiswa = await ProfileMahasiswa.query().where('user_id', auth.user!.id).firstOrFail()
      
      const res = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/QueryAsset",
        [ data_mahasiswa.nim ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )
      console.log(res)
      return view.render('pages/mahasiswa/kegiatan_new', { data: data_mahasiswa.nim, data_pendaftaran: res.data })
    } catch (e) {
      session.flash('error', e.message)
      return view.render('pages/mahasiswa/kegiatan_new')
    }
  }

  public async store({ auth, request, session, response}: HttpContextContract) {
    await auth.use('web').authenticate()
    const nim = request.input('nim')
    const nama_kegiatan = request.input('nama_kegiatan')
    const deskripsi = request.input('deskripsi_kegiatan')
    const id_pendaftaran = request.input('id_pendaftaran')

    try {
      const payload = [
        randomstring.generate(7), 
        id_pendaftaran, 
        nim, 
        nama_kegiatan,
        deskripsi
      ]
      const res = await axios.put("http://localhost:3000/submit/kegiatan-channel/kegiatan-chaincode/CreateAsset",
      payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )

      session.flash('success', res.data.message + ', ID Transaksi Blockchain : ' + res.data.idTrx)
      return response.redirect().back()
    } catch(e) {
      console.log(e)
      session.flash('error', e.message)
    }
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
