import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileMitra from '../../Models/ProfileMitra';
import ProfileMahasiswa from '../../Models/ProfileMahasiswa';
const axios = require('axios')
import { Web3Storage, getFilesFromPath } from 'web3.storage'
const randomstring = require("randomstring");

export default class NilaiController {
  public async indexAll({ view, auth, session, response }: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const data_nilai = await axios.put("http://localhost:3000/evaluate/nilai-channel/nilai-chaincode/GetAllAssets",
        [ ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )

      return view.render('pages/nilai', { data: data_nilai.data })
    } catch (e) {
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }

  public async indexAllNIM({ view, auth, session, response, params }: HttpContextContract) {
    await auth.use('web').authenticate()
    const pid = params.pid
    try {
      const data_nilai = await axios.put("http://localhost:3000/evaluate/nilai-channel/nilai-chaincode/ReadAsset",
        [ pid ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )
      const data_mahasiswa = await ProfileMahasiswa.query().where('nim', data_nilai.data.nim).firstOrFail()
      console.log(data_mahasiswa)
      return view.render('pages/nilai_check', { data_nilai: data_nilai.data, data: data_mahasiswa })
    } catch (e) {
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }

  public async index({ view, auth, session, response }: HttpContextContract) {
    auth.use('web').authenticate()
    
    try {
      const data_mitra = await ProfileMitra.query().where('user_id', auth.user!.id).firstOrFail()

      try {
        const res = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/QueryByMitra",
          [ data_mitra.kode_mitra ], {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          }
        )
        
        const res2 = await axios.put("http://localhost:3000/evaluate/nilai-channel/nilai-chaincode/QueryByMitra",
          [ data_mitra.kode_mitra ], {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          }
        )
        if(res2.data.length == 0) {
          res2.data = [{Record: {id: 0, nama: "Tidak ada data"}}]
        }

        return view.render('pages/mitra/nilai', { data: res.data, data_n: res2.data })
      } catch (e) {
        console.log(e)
        session.flash('error', e.message)
        return view.render('pages/mitra/nilai')
      }
    } catch (e) {
      if(e.message === 'E_ROW_NOT_FOUND: Row not found') {
        session.flash('error', 'Anda belum mengisi data diri')
        return response.redirect('/mitra/profile')
      }
      session.flash('error', e.message)
      return view.render('pages/mitra/nilai')
    }
  }

  public async create({ view, auth, response, session, params }: HttpContextContract) {
    const id_pendaftaran = params.id
    await auth.use('web').authenticate()
    try {
      
      const res = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/ReadAsset",
        [ id_pendaftaran ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )

      const data_mahasiswa = await ProfileMahasiswa.query().where('nim', res.data.nim).firstOrFail()

      const res2 = await axios.put("http://localhost:3000/evaluate/nilai-channel/nilai-chaincode/QueryAsset",
          [ res.data.nim ], {
            headers: {
              "X-API-Key": auth.user!.role,
            }
        }
      )

      let ditolak = false;
      for(let i = 0; i < res2.data.length; i++) {
        if (res2.data[i].Record.pendaftaranId == id_pendaftaran) {
          ditolak = true
        }
      }

      return view.render('pages/mitra/nilai_new', { data_mahasiswa: data_mahasiswa, ditolak: ditolak, id_pendaftaran: res.data.id, data_pendaftaran: res.data })
    } catch (e) {
      session.flash('error', e.message)
      return response.redirect().back()
    }

  }

  public async store({ auth, request, session, response}: HttpContextContract) {
    await auth.use('web').authenticate()
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

      const res2 = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/ReadAsset",
        [ id_pendaftaran ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )


      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM4ZjNjRjZiMTFGNjBiRjJlODg5ZjEzODljRjI4MjQ0QjZDQkFBNTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAxODY3NzQ0NjEsIm5hbWUiOiJza3JpcHNpIn0.4wGz4ChtMzoR-86ITyh3jcI3u13K4jhu9J3f203WIGE"
      const storage = new Web3Storage({ token})
      const pathFiles = await getFilesFromPath("storage/uploads/" + laporanFileName)
      const cid = await storage.put(pathFiles)
      console.log(cid)
      try {
        const payload = [
          randomstring.generate(14), 
          res2.data.mitraId, 
          res2.data.id, 
          res2.data.nim, 
          cid,
        ]
        const res = await axios.put("http://localhost:3000/submit/nilai-channel/nilai-chaincode/CreateAsset",
        payload, {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          }
        )

        await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/UpdateStatusMBKM",
        [ res2.data.id, "true" ], {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          }
        )

        await axios.put("http://localhost:3000/submit/prodi-channel/prodi-chaincode/UpdateStatusMBKM",
        [ res2.data.persetujuanId, "true" ], {
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
