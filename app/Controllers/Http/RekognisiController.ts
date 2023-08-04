import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileMahasiswa from '../../Models/ProfileMahasiswa'
const axios = require('axios')

export default class RekognisiController {
  public async index({ view }: HttpContextContract) {
    return view.render('pencarian')
  }

  public async show({ view, request, session, response}: HttpContextContract) {
    const nim = request.param('nim')
    try {
      const data_mahasiswa = await ProfileMahasiswa.query().where('nim', nim).firstOrFail()
      try {
        try{
          const sr_prodi = await axios.put("http://localhost:3000/evaluate/prodi-channel/sr-chaincode/QueryAsset", 
            [ nim ], {
              headers: {
                "X-API-Key": "WakilRektor",
              }
            }
          )
          try{  
            const sr_univ = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/registry-chaincode/QueryAsset", 
              [ nim ], {
                headers: {
                  "X-API-Key": "WakilRektor",
                }
              }
            )
            console.log(sr_univ.data, sr_prodi.data)
            return view.render('rekognisi', { data_mahasiswa: data_mahasiswa, sr_prodi: sr_prodi.data, sr_univ: sr_univ.data })
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
      if(e.message === 'E_ROW_NOT_FOUND: Row not found') {
        session.flash('error', 'Data Tidak Ditemukan')
        return view.render('rekognisi')
      }
      session.flash('error', e.message)
      return view.render('rekognisi')

    }


  }
}
