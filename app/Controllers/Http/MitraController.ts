import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '../../Models/User'

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

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
