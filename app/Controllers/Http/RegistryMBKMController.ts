import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Web3Storage, getFilesFromPath } from 'web3.storage'
const axios = require('axios')
import ProfileMahasiswa from '../../Models/ProfileMahasiswa'
import ProfileMitra from '../../Models/ProfileMitra'
const randomstring = require("randomstring");

const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const fs = require("fs");
const path = require("path");

export default class RegistryMBKMController {
  public async indexMahasiswa({auth, session, response, view}: HttpContextContract) {
    await auth.use('web').authenticate()

    try {
      const data = await ProfileMahasiswa.query().where('user_id', auth.user!.id).firstOrFail()
      const data_mitra = await ProfileMitra.all()
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
      const result = res.data;
      if(result.length == 0){ 
        status = false
      }
      for (let i = 0; i < result.length; i++) {
        if (result[i].Record.nim = data.nim && result[i].Record.persetujuan == "true") {
          status = true
        } else {
          status = false
        }
      }

      const res2 = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/registry-chaincode/QueryAsset", 
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
      if(status_pendaftaran == true) {
        console.log("Hello :", result2)
        return view.render('pages/mahasiswa/mbkm_new', { data_b: result2[0], status_pendaftaran: status_pendaftaran, tanggal: tanggal, data_mitra: data_mitra, status_sr: status, status_mbkm: status_mbkm, data: data, ditolak: ditolak })
      } else {
        return view.render('pages/mahasiswa/mbkm_new', { status_pendaftaran: status_pendaftaran, tanggal: tanggal, data_mitra: data_mitra, status_sr: status, status_mbkm: status_mbkm, data: data, ditolak: ditolak })
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
      const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/registry-chaincode/GetAllAssets", 
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

  public async storeMahasiswa({ session, request, response, auth }: HttpContextContract) {
    await auth.use('web').authenticate()
    
    const mitra = request.input('mitra')
    const program = request.input('program')

    const data_mahasiswa = await ProfileMahasiswa.query().where('user_id', auth.user!.id).firstOrFail()

    // axios
    const payload = [
        randomstring.generate(7),
        mitra,
        data_mahasiswa.nim,
        "",
        program,
        "false"
    ];

    try {
      const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/registry-chaincode/CreateAsset", 
        payload, {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );

      console.log(res);

      session.flash('success', 'Telah berhasil membuat surat rekomendasi universitas')
      return response.redirect().back()
    } catch(e) {
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }



  public async setujuiMBKM({ auth, session, response, request }: HttpContextContract) {
    await auth.use('web').authenticate()
    
    const mitra = request.input('mitra')
    const program = request.input('program')
    const nim = request.input('nim')
    const id = request.input('id')
    const created_at = request.input('created_at')
    const persetujuan = request.input('persetujuan')
    console.log("UDAH DISINI")
    try {// Load the docx file as binary content
      if(persetujuan == 'true') {
      const content = fs.readFileSync(
        path.resolve("template_surat", "template_sru.docx"),
        "binary"
      );
      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      console.log("Udah disini")
      try{
        const mahasiswa = await ProfileMahasiswa.query().where('nim', nim).firstOrFail()
        // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
        doc.render({
          nama_lengkap: mahasiswa.nama_lengkap,
          username: mahasiswa.nim,
          semester: "8",
          ipk: mahasiswa.ipk,
          sks: mahasiswa.jumlah_sks
        });
      
        const buf = doc.getZip().generate({
          type: "nodebuffer",
          // compression: DEFLATE adds a compression step.
          // For a 50MB output document, expect 500ms additional CPU time
          compression: "DEFLATE",
        });
      
        // buf is a nodejs Buffer, you can either write it to a
        // file or res.send it with express for example.
        try {
          fs.writeFileSync(path.resolve("surat", "output.docx"), buf);
        
        } catch (e) {

          session.flash('error', e.message)
          return response.redirect().back()
        }
        
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM4ZjNjRjZiMTFGNjBiRjJlODg5ZjEzODljRjI4MjQ0QjZDQkFBNTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAxODY3NzQ0NjEsIm5hbWUiOiJza3JpcHNpIn0.4wGz4ChtMzoR-86ITyh3jcI3u13K4jhu9J3f203WIGE"
        const storage = new Web3Storage({ token})
        const pathFiles = await getFilesFromPath("surat/output.docx")
        const cid = await storage.put(pathFiles)
        console.log('Content added with CID:', cid)
        try {
          const payload = [
            id,
            mitra,
            nim,
            cid,
            program,
            "true",
            "false",
            created_at
          ];

          const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/registry-chaincode/UpdateAsset", 
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
          mitra,
          nim,
          "",
          program,
          persetujuan,
          "false",
          created_at
        ];

        const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/registry-chaincode/UpdateAsset", 
          payload, {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          });
        console.log(res);
        session.flash('success', res.data.message + " ID Transaksi Blockchain : " + res.data.idTrx)
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

      const res = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/registry-chaincode/QueryAsset",
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

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
