import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Web3Storage, getFilesFromPath } from 'web3.storage'
const axios = require('axios')
import ProfileMahasiswa from '../../Models/ProfileMahasiswa'
import ProfileMitra from '../../Models/ProfileMitra'
const randomstring = require("randomstring");

export default class RegistryMBKMController {
  public async indexMahasiswa({auth, session, response, view}: HttpContextContract) {
    await auth.use('web').authenticate()

    try {
      const data = await ProfileMahasiswa.query().where('user_id', auth.user!.id).firstOrFail()
      const data_mitra = await ProfileMitra.all()
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
      let id_persetujuan;
      const result = res.data;
      if(result.length == 0){ 
        status = false
      }
      for (let i = 0; i < result.length; i++) {
        console.log(result[i].Key)
        if (result[i].Record.nim = data.nim && result[i].Record.persetujuan == "true" && result[i].Record.selesai == "false") {
          status = true
          id_persetujuan = result[i].Key
        } else {
          status = false
          id_persetujuan = result[i].Key
        }
      }

      const res2 = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/QueryAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );

      let status_mbkm;
      let status_pendaftaran = false;
      let tanggal;
      let ditolak = false;
      const result2 = res2.data;
      if(result2.length == 0){ 
        status_mbkm = false
      }
      for (let i = 0; i < result2.length; i++) {
        if (result2[i].Record.nim = data.nim && result2[i].Record.persetujuan == "false") {
          status_mbkm = true
          tanggal = result2[i].Record.created_at
        } else if (result2[i].Record.nim = data.nim && result2[i].Record.persetujuan == "denied"){
          status_pendaftaran = false
          ditolak = true
          tanggal = result2[i].Record.updated_at
        } else if (result2[i].Record.nim = data.nim && result2[i].Record.persetujuan == "true"){
          status_pendaftaran = true
          tanggal = result2[i].Record.updated_at
        }
      }
      console.log("Sampe sini : ",id_persetujuan)
      if(status_pendaftaran == true) {
        console.log("Hello :", result2)
        return view.render('pages/mahasiswa/mbkm_new', { data_b: result2[0], status_pendaftaran: status_pendaftaran, tanggal: tanggal, data_mitra: data_mitra, status_sr: status, status_mbkm: status_mbkm, data: data, ditolak: ditolak })
      } else {
        console.log(id_persetujuan)
        return view.render('pages/mahasiswa/mbkm_new', { id_persetujuan: id_persetujuan, status_pendaftaran: status_pendaftaran, tanggal: tanggal, data_mitra: data_mitra, status_sr: status, status_mbkm: status_mbkm, data: data, ditolak: ditolak })
      }
    } catch (e) {
      if(e.message === 'E_ROW_NOT_FOUND: Row not found') {
        session.flash('error', 'Anda belum mengisi data diri')
        return response.redirect('/mahasiswa/profile')
      }
      session.flash('error', e.message)
      return view.render('pages/mahasiswa/mbkm_new')
    }
  }

  public async indexWakilRektor({ auth, view, session}: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/GetAllAssets", 
        {}, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );
      const result = res.data;
      console.log(result)
      return view.render('pages/wakilrektor/mbkm', { data: result })
    } catch (e) {
      console.log(e)
      session.flash('error', e.message)
      return view.render('pages/wakilrektor/mbkm')
    }
  }

  public async indexPIC({ auth, view, session}: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/GetAllAssets", 
        {}, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );
      const result = res.data;
      console.log(result)
      return view.render('pages/pic/pendaftaran', { data: result })
    } catch (e) {
      console.log(e)
      session.flash('error', e.message)
      return view.render('pages/pic/pendaftaran')
    }
  }

  public async storeMahasiswa({ session, request, response, auth }: HttpContextContract) {
    await auth.use('web').authenticate()
    
    const program = request.input('program')
    const id_persetujuan = request.input('id_persetujuan')
     

    const data_mahasiswa = await ProfileMahasiswa.query().where('user_id', auth.user!.id).firstOrFail()

    // axios
    const payload = [
        randomstring.generate(14),
        data_mahasiswa.nim,
        data_mahasiswa.nama_lengkap,
        id_persetujuan,
        "",
        program,
        "false",
    ];

    try {
      const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/CreateAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );

      console.log(res);

      session.flash('success', res.data.message + " ID Transaksi Blockchain : " + res.data.idTrx)
      return response.redirect().back()
    } catch(e) {
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }



  public async setujuiMBKM({ auth, session, response, request }: HttpContextContract) {
    await auth.use('web').authenticate()
    
    const id = request.input('id')
    const persetujuan = request.input('persetujuan')

    const sr_universitas = request.file('sru',{
      size: '2mb',
      extnames: ['pdf'],
    })
    console.log(sr_universitas)

    if (sr_universitas) {
      console.log("DEBUG: sr_universitas")
      await sr_universitas.moveToDisk('./')
    }
    
    const sruFileName: any = sr_universitas?.fileName 

    const sptjm = request.file('sptjm',{
      size: '2mb',
      extnames: ['pdf'],
    })
    console.log(sptjm)

    if (sptjm) {
      console.log("DEBUG: sptjm")
      await sptjm.moveToDisk('./')
    }
    
    const sptjmFileName: any = sptjm?.fileName 

    try {// Load the docx file as binary content
      if(persetujuan == 'true') {
      console.log("Udah disini")
      try{
        // const mahasiswa = await ProfileMahasiswa.query().where('nim', nim).firstOrFail()
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM4ZjNjRjZiMTFGNjBiRjJlODg5ZjEzODljRjI4MjQ0QjZDQkFBNTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAxODY3NzQ0NjEsIm5hbWUiOiJza3JpcHNpIn0.4wGz4ChtMzoR-86ITyh3jcI3u13K4jhu9J3f203WIGE"
        const storage = new Web3Storage({ token})
        const pathFiles = await getFilesFromPath(["storage/uploads/" + sptjmFileName, "storage/uploads/" + sruFileName])
        const cid = await storage.put(pathFiles)
        console.log('Content added with CID:', cid)
        try {
          const payload = [
            id,
            persetujuan,
            cid
          ];

          const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/UpdateStatus", 
            payload, {
              headers: {
                "X-API-Key": auth.user!.role,
              }
            });
          console.log(res);
          session.flash('success', res.data.message + " ID Transaksi Blockchain : " + res.data.idTrx)
          return response.redirect().back()

        } catch (e) {
          console.log(e)
          session.flash('error', e.message)
          return response.redirect().back()
        }

      } catch (e) {
        console.log(e)
        session.flash('error', e.message)
        return response.redirect().back()
      }
      } else if(persetujuan == 'denied') {
        const payload = [
          id,
          persetujuan,
          ""

        ];

        const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/UpdateStatus", 
          payload, {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          });
        console.log(res);
        session.flash('success', "Pembuatan Surat telah ditolak, ID Transaksi Blockchain : " + res.data.idTrx)
        return response.redirect().back()
      }

    } catch (e) {
      console.log(e)
      session.flash('error', 'Gagal Generate Surat Rekomendasi Universitas')
      return response.redirect().back()
    }
  }

  public async checkPendaftar({ request, view, auth, response, session }: HttpContextContract) {
    await auth.use('web').authenticate()

    const nim = request.param('nim')
    try {
      const data = await ProfileMahasiswa.query().where('nim', nim).firstOrFail()

      const res = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/QueryAsset",
        [ data.nim ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      )
      let status = false;
      if (res.data[0].Record.persetujuan == "true") {
        status = true
      } else if (res.data[0].Record.persetujuan == "false") {
        status = false
      }

      return view.render('pages/wakilrektor/check_pendaftar', { nim: nim, data: data, data_blockchain: res.data[0].Record, status: status })
    } catch (e) {
      console.log(e)
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }

  public async riwayatSR({ view, auth }: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const data = await ProfileMahasiswa.query().where('user_id', auth.user!.id).firstOrFail()
      
      // axios
      const payload = [ data.nim ];

      const res = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/QueryAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );

      const res2 = await axios.put("http://localhost:3000/evaluate/prodi-channel/prodi-chaincode/QueryAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );

      return view.render('pages/mahasiswa/sr', { data_a: res.data, data_b: res2.data })

    } catch (e) {
      console.log(e)
    }
  }
  
  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
