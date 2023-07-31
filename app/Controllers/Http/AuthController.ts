import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  public async login({ view }: HttpContextContract) {
    return view.render('pages/auth/login')
  }
  
  public async process({ request, response, auth, session }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
  
    try {
      await auth.use('web').attempt(email, password)
      response.redirect('/dashboard')
    } catch(e) {
      session.flash('error', e.message)
      response.redirect().back()
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.use('web').logout()
    response.redirect('/login')
  }
}
