import Route from '@ioc:Adonis/Core/Route'

Route.get('/login', async ({ view }) => {
    return view.render('pages/auth/login')
})

Route.post('/login', 'AuthController.process').as('login.process')

Route.get('/logout', 'AuthController.logout').as('logout')