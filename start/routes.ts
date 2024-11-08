// Route File
import './routes/auth'
import './routes/direktorat'
import './routes/mahasiswa'
import './routes/mitra'
import './routes/pic'
import './routes/prodi'
import './routes/wakilrektor'

import Route from '@ioc:Adonis/Core/Route'
const axios = require('axios');

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})

Route.get('/dashboard', async ({ view, auth }) => {
  await auth.use('web').authenticate()
  
  if (auth.user?.role == 'WakilRektor') {

    const res = await axios.put("http://localhost:3000/submit/pendaftaran-channel/pendaftaran-chaincode/GetAllAssets", 
      {}, {
        headers: {
          "X-API-Key": auth.user!.role,
        }
      }
    );

    const result = res.data.reduce((acc, cur) => {
      const year = new Date(cur.created_at).getFullYear();
      if (!acc[year]) {
        acc[year] = { year: year, data: [] };
      }
      acc[year].data.push(cur);
      return acc;
    }, {});
    
    let data: Array<number> = [];
    let tahun: Array<number> = [];
    for(let i in result) {
      tahun.push(result[i].year);
      data.push(result[i].data.length);
    }
    return view.render('pages/home/wakilrektor', { data_tahun: tahun, data: data })
  } else {
    return view.render('pages/home/dashboard')
  }
})

Route.get('/rekognisi', 'RekognisiController.index')
Route.get('/rekognisi/find', 'RekognisiController.find').as('rekognisi.find')
Route.get('/rekognisi/:nim/:pid', 'RekognisiController.show').as('rekognisi.show')
Route.post('/rekognisi','RekognisiController.search').as('rekognisi.search')
Route.get('/uploads/:filename', async ({ response, params }) => {
  response.download('./', params.filename)
})

Route.get('/pdfview/:filename', async ({ view, params }) => {
  return view.render('pdf', { filename: params.filename })
})