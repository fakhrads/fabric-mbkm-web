import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '../../Models/User'
import ProfileMitra from '../../Models/ProfileMitra'
const axios = require('axios')

export default class MitraController {
  public async index({ view, auth }: HttpContextContract) {
    await auth.use('web').authenticate()

    const data_mitra = await User.query().where('role', 'Mitra')
    console.log(data_mitra)
    return view.render('pages/pic/mitra', { data: data_mitra })
  }

  public async create({ view, auth }: HttpContextContract) {
    await auth.use('web').authenticate()

    return view.render('pages/pic/mitra_new')
  }

  public async store({ auth, request, response, session }: HttpContextContract) {
    await auth.use('web').authenticate()
    const email = request.input('email')
    const password = request.input('password')

    try {
      await User.create({
        email: email,
        password: password,
        role: 'Mitra',
      })

      session.flash('success', 'Data berhasil ditambahkan')
      return response.redirect().toRoute('pic.mitra.new')
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  public async show({ request, session, auth, view, response }: HttpContextContract) {
    await auth.use('web').authenticate()
    try {
      const user_id = request.param('id')
      const user = await User.findOrFail(user_id)
      try {
        const data_mitra = await ProfileMitra.query().where('user_id', user_id).firstOrFail()
        console.log(data_mitra)
        const res = await axios.put("http://localhost:3000/evaluate/pendaftaran-channel/pendaftaran-chaincode/GetAllAssets", 
          {}, {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          }
        );
        const result = res.data;

        return view.render('pages/pic/mitra_edit', { data: user, data_mitra: data_mitra, data_p: result })
      } catch(e) {
        if(e.message === 'E_ROW_NOT_FOUND: Row not found') {
          session.flash('error', 'Mitra belum mengisi data yang diperlukan.')
          return response.redirect().back()
        }
      }
    } catch (e) {
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }

  public async updateMitra({ auth, request, session, response }: HttpContextContract) {
    await auth.use('web').authenticate()
    const id = request.input('id')
    const id_pendaftaran = request.input('id_pendaftaran')
    
    try {
      const data_mitra = await ProfileMitra.findByOrFail('id', id)
      
      const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/UpdateMitra", 
        [ id_pendaftaran, data_mitra.kode_mitra ], {
          headers: {
            "X-API-Key": auth.user!.role,
          }
        }
      );
      const result = res.data;
      console.log(result)
      session.flash('success', 'Berhasil menautkan data mitra dengan pendaftaran MBKM')
      return response.redirect().back()
    } catch(e) {
      session.flash('error', e.message)
      return response.redirect().back()
    }
  }

  public async updatePassword({ auth, request, response, session }: HttpContextContract) {
    await auth.use('web').authenticate()
    const id = request.input('id')
    console.log("id: ", id)
    try {
      const data_mitra = await User.findByOrFail('id', id)
      data_mitra.password = request.input('password')
      await data_mitra.save()

      session.flash('success', 'Password mitra berhasil diubah')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  public async destroy({ auth, request, session, response}: HttpContextContract) {
    await auth.use('web').authenticate()

    const user_id = request.input('user_id')
    try {
      const user = await User.findOrFail(user_id)
      await user.delete()
      
      session.flash('success', "User berhasil dihapus")
      return response.redirect().back()
    } catch(e) {
      session.flash('errors', e)
      return response.redirect().back()
    }
  }
}
