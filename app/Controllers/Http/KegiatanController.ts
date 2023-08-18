import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileMahasiswa from '../../Models/ProfileMahasiswa'
import { Web3Storage, getFilesFromPath } from 'web3.storage'

const axios = require('axios')
const randomstring = require("randomstring");
export default class KegiatanController {

  public async indexPIC({ view, auth, session}: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const res = await axios.put("http://localhost:3000/evaluate/kegiatan-channel/kegiatan-chaincode/GetAllAssets",
        [  ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )
      return view.render('pages/kegiatan', { data: res.data })
    } catch(e) {
      session.flash('error', e.message)
      return view.render('pages/mahasiswa/kegiatan')
    }
  }

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

      const res2 = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/QueryAsset",
        [ data_mahasiswa.nim ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )
      if(res.data.length == 0) {
        res.data = [{Record: {id: 0, nama: "Tidak ada data"}}]
      }

      return view.render('pages/mahasiswa/kegiatan', { data: res2.data, data_k: res.data })
    } catch(e) {
      session.flash('error', e.message)
      return view.render('pages/mahasiswa/kegiatan')
    }
  }

  public async create({ view, auth, session, params }: HttpContextContract) {
    const id_pendaftaran = params.id
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

      const res2 = await axios.put("http://localhost:3000/evaluate/kegiatan-channel/kegiatan-chaincode/QueryAsset",
          [ data_mahasiswa.nim ], {
            headers: {
              "X-API-Key": auth.user!.role,
            }
        }
      )

      let ditolak = false;
      for(let i = 0; i < res2.data.length; i++) {
        console.log(res2.data[i].Record.id)
        if (res2.data[i].Record.pendaftaranId == id_pendaftaran) {
          ditolak = true
        }
      }

      console.log(res)
      return view.render('pages/mahasiswa/kegiatan_new', { ditolak: ditolak, id_pendaftaran: id_pendaftaran, data: data_mahasiswa.nim, data_pendaftaran: res.data })
    } catch (e) {
      session.flash('error', e.message)
      return view.render('pages/mahasiswa/kegiatan_new')
    }
  }

  public async store({ auth, request, session, response}: HttpContextContract) {
    await auth.use('web').authenticate()
    const nim = request.input('nim')
    const id_pendaftaran = request.input('id_pendaftaran')

    const laporan = request.file('laporan',{
      size: '5mb',
      extnames: ['pdf'],
    })
    console.log(laporan)

    if (laporan) {
      console.log("DEBUG: laporan")
      await laporan.moveToDisk('./')
    }
    
    const laporanFileName: any = laporan?.fileName 

    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM4ZjNjRjZiMTFGNjBiRjJlODg5ZjEzODljRjI4MjQ0QjZDQkFBNTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAxODY3NzQ0NjEsIm5hbWUiOiJza3JpcHNpIn0.4wGz4ChtMzoR-86ITyh3jcI3u13K4jhu9J3f203WIGE"
      const storage = new Web3Storage({ token})
      const pathFiles = await getFilesFromPath("storage/uploads/" + laporanFileName)
      const cid = await storage.put(pathFiles)
      console.log(cid)
      try {
        const payload = [
          randomstring.generate(7), 
          id_pendaftaran, 
          nim, 
          cid,
        ]
        const res = await axios.put("http://localhost:3000/submit/kegiatan-channel/kegiatan-chaincode/CreateAsset",
        payload, {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          }
        )

        await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/UpdateStatusLaporan",
        [ id_pendaftaran, "true" ], {
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
    } catch (e) {
      console.log(e)
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }
}
