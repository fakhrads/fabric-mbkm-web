import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileMahasiswa from '../../Models/ProfileMahasiswa'
const axios = require('axios')

export default class RekognisiController {
  public async index({ view }: HttpContextContract) {
    return view.render('pencarian')
  }

  public async search({ request, response, view}: HttpContextContract) {
    const nim = request.input('nim')
    try {
      const sr_prodi = await axios.put("http://localhost:3000/evaluate/prodi-channel/prodi-chaincode/QueryAsset", 
        [ nim ], {
          headers: {
            "X-API-Key": "WakilRektor",
          }
        }
      )
      console.log(sr_prodi.data)
      return view.render('find', { data: sr_prodi.data })
    } catch (e) {
      console.log(e.message)
      return response.redirect().back()
    }

  }

  public async show({ view, request, session}: HttpContextContract) {
    const nim = request.param('nim')
    const pid = request.param('pid')
    try {
      const data_mahasiswa = await ProfileMahasiswa.query().where('nim', nim).firstOrFail()
      try {
        try{
          const sr_prodi = await axios.put("http://localhost:3000/evaluate/prodi-channel/prodi-chaincode/ReadAsset", 
            [ pid ], {
              headers: {
                "X-API-Key": "WakilRektor",
              }
            }
          )
          try{  
            const sr_univ = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/QueryByPersetujuanID", 
              [ sr_prodi.data.id ], {
                headers: {
                  "X-API-Key": "WakilRektor",
                }
              }
            )
            console.log(sr_univ.data)
            try{
              const kegiatan = await axios.put("http://localhost:3000/evaluate/kegiatan-channel/kegiatan-chaincode/QueryAsset", 
                [ nim ], {
                  headers: {
                    "X-API-Key": "WakilRektor",
                  }
                }
              )
              console.log(kegiatan.data)
              try {
                const nilai = await axios.put("http://localhost:3000/evaluate/nilai-channel/nilai-chaincode/QueryAsset", 
                  [ nim ], {
                    headers: {
                      "X-API-Key": "WakilRektor",
                    }
                  }
                )
                console.log(nilai.data)
                return view.render('rekognisi', { data_mahasiswa: data_mahasiswa, sr_prodi: sr_prodi.data, sr_univ: sr_univ.data, kegiatan: kegiatan.data, nilai: nilai.data })
  
              } catch (e) {
                session.flash('error', e.message)
                return view.render('rekognisi')
              }
            } catch (e) {
              session.flash('error', e.message)
              return view.render('rekognisi')
            }
          } catch (e) {
            session.flash('error', e.message)
            return view.render('rekognisi')
          }
        } catch (e) {
          session.flash('error', e.message)
          return view.render('rekognisi')
        }
      } catch (e) {
        session.flash('error', e.message)
        return view.render('rekognisi')
      }
    } catch (e) {
      console.log("ERROR 1 : " + e.message)
      if(e.message === 'E_ROW_NOT_FOUND: Row not found') {
        session.flash('error', 'Data Tidak Ditemukan')
        return view.render('rekognisi')
      }
      session.flash('error', e.message)
      return view.render('rekognisi')

    }


  }
}
