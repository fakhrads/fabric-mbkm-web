import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const axios = require("axios");
const randomstring = require("randomstring");
import ProfileMahasiswa from '../../Models/ProfileMahasiswa';

export default class SRController {
  public async indexMahasiswa({ view, auth, session, response }: HttpContextContract) {
    await auth.use('web').authenticate()

    try {
      const data = await ProfileMahasiswa.query().where('user_id', auth.user!.id).firstOrFail()
      
      // axios
      const payload = [ data.nim ];

      const res = await axios.put("http://localhost:3000/evaluate/prodi-channel/sr-chaincode/QueryAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );
      let status;
      let status_pembuatan = false;
      let tanggal;
      const result = res.data;
      if(result.length == 0){ 
        status = false
      }
      for (let i = 0; i < result.length; i++) {
        if (result[i].Record.nim = data.nim && result[i].Record.persetujuan == "false") {
          status = true
          tanggal = result[i].Record.created_at
        } else {
          status_pembuatan = true
          tanggal = result[i].Record.updated_at
        }
      }
      return view.render('pages/mahasiswa/sr_new', { tanggal: tanggal, status_sr: status, status_pembuatan: status_pembuatan, data: data })
    } catch (e) {
      if(e.message === 'E_ROW_NOT_FOUND: Row not found') {
        session.flash('error', 'Anda belum mengisi data diri')
        return response.redirect('/mahasiswa/profile')
      }
      session.flash('error', e.message)
      return view.render('pages/mahasiswa/sr_new')
    }

  }

  public async indexProdi({ view, auth, session }: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const res = await axios.put("http://localhost:3000/evaluate/prodi-channel/sr-chaincode/GetAllAssets", 
        {}, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );
      const result = res.data;
      console.log(result)
      return view.render('pages/prodi/sr', { data: result })
    } catch (e) {
      console.log(e)
      session.flash('error', e.message)
      return view.render('pages/prodi/sr')
    }
  } 

  public async setujuiSRP({ auth, session, request, response }: HttpContextContract) {
    await auth.use('web').authenticate()

    const id = request.input('id')
    const nim = request.input('nim')
    const program = request.input('program')
    const created_at = request.input('created_at')

    const payload = [
      id,
      nim,
      "",
      program,
      'true',
      created_at
    ]
    
    try {
      const res = await axios.put("http://localhost:3000/submit/prodi-channel/sr-chaincode/UpdateAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        });

      console.log(res);
    
      session.flash('success', 'Telah berhasil menyetujui surat rekomendasi')
      return response.redirect().back()
    } catch(e) {
      console.log(e)
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }

  public async storeMahasiswa({ session, request, auth, response }: HttpContextContract) {
    await auth.use('web').authenticate()
    const nim = request.input('nim')
    const program = request.input('program')
    console.log(nim, program)
    // axios
    const payload = [
        randomstring.generate(7),
        nim,
        "",
        program,
        "false",
      ];

    try {
      const res = await axios.put("http://localhost:3000/submit/prodi-channel/sr-chaincode/CreateAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );

      console.log(res)
      session.flash('success', 'Pembuatan SR berhasil dilakukan')
      return response.redirect().back()
    } catch(e) {
      console.log(e)
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
