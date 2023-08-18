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

      const res = await axios.put("http://localhost:3000/evaluate/prodi-channel/prodi-chaincode/QueryAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );
      let status;
      let status_pembuatan = false;
      let ditolak = false;
      let tanggal;
      let id;
      const result = res.data;
      if(result.length == 0){ 
        status = false
      }
      for (let i = 0; i < result.length; i++) {
        if (result[i].Record.nim = data.nim && result[i].Record.persetujuan == "false" && result[i].Record.selesai == "false") {
          status = true
          tanggal = result[i].Record.created_at
        } else if (result[i].Record.nim = data.nim && result[i].Record.persetujuan == "denied" && result[i].Record.selesai == "true"){
          status_pembuatan = false
          ditolak = true
          tanggal = result[i].Record.updated_at
        } else if (result[i].Record.nim = data.nim && result[i].Record.persetujuan == "true" && result[i].Record.selesai == "false"){
          status_pembuatan = true
          id = result[i].Key
          tanggal = result[i].Record.updated_at
        } else if (result[i].Record.nim = data.nim && result[i].Record.persetujuan == "true" && result[i].Record.selesai == "true"){
          status_pembuatan = false
          status = false
          id = result[i].Key
          tanggal = result[i].Record.updated_at
        }
      }
      console.log(ditolak)
      return view.render('pages/mahasiswa/sr_new', { tanggal: tanggal, status_sr: status, status_pembuatan: status_pembuatan, data: data, id: id, ditolak: ditolak })
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
      const res = await axios.put("http://localhost:3000/evaluate/prodi-channel/prodi-chaincode/GetAllAssets", 
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
    const persetujuan = request.input('persetujuan')

    let selesai = "false"
    if (persetujuan == "denied") {
      selesai = "true"
    }
    console.log("DEBUG : " + selesai)
    const payload = [
      id,
      persetujuan,
      selesai,
    ]
    
    try {
      const res = await axios.put("http://localhost:3000/submit/prodi-channel/prodi-chaincode/UpdatePersetujuan", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        });

      console.log(res);
    
      session.flash('success', res.data.message + " ID Transaksi Blockchain : " + res.data.idTrx)
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
    console.log(nim)
    // axios
    const payload = [
        randomstring.generate(14),
        nim,
        "false",
      ];

    try {
      const res = await axios.put("http://localhost:3000/submit/prodi-channel/prodi-chaincode/CreateAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );

      console.log(res)
      session.flash('success', res.data.message + " ID Transaksi Blockchain : " + res.data.idTrx)
      return response.redirect().back()
    } catch(e) {
      console.log(e)
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }

  public async checkPendaftar({ request, view, auth, response, session }: HttpContextContract) {
    await auth.use('web').authenticate()

    const nim = request.param('nim')
    const pid = request.param('pid')
    try {
      const data = await ProfileMahasiswa.query().where('nim', nim).firstOrFail()

      const res = await axios.put("http://localhost:3000/evaluate/prodi-channel/prodi-chaincode/ReadAsset",
        [ pid ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )
      let status = false;
      if (res.data.persetujuan == "true") {
        status = true
      } else if (res.data.persetujuan == "false") {
        status = false
      }

      return view.render('pages/prodi/sr_check', { nim: nim, data: data, data_blockchain: res.data, status: status })
    } catch (e) {
      console.log(e)
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }
}
