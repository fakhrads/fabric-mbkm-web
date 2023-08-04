import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProfileMitra from '../../Models/ProfileMitra';
const axios = require('axios')

export default class NilaiController {
  public async index({ view, auth, session, response }: HttpContextContract) {
    auth.use('web').authenticate()
    
    try {
      await ProfileMitra.query().where('user_id', auth.user!.id).firstOrFail()

      try {
        const res = await axios.put("http://localhost:3000/evaluate/nilai-channel/score-chaincode/GetAllAssets", 
          {}, {
            headers: {
              "X-API-Key": auth.user!.role,
            }
          }
        );
        const result = res.data;
        console.log(result)
        return view.render('pages/mitra/nilai', { data: result })
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

  public async create({ view, auth }: HttpContextContract) {
    auth.use('web').authenticate()

    return view.render('pages/mitra/nilai_new')

  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
