import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from '../../app/Models/User'

export default class extends BaseSeeder {
  public async run () {
    await User.createMany([
      {
        email: 'fakhri@mahasiswa.unikom.ac.id',
        password: 'secret',
        role: 'Mahasiswa'
      },
      {
        email: 'mitra@mitra.com',
        password: 'secret',
        role: 'Mitra'
      },
      {
        email: 'prodi@prodi.unikom.ac.id',
        password: 'secret',
        role: 'ProgramStudi'
      },
      {
        email: 'pic@pic.unikom.ac.id',
        password: 'secret',
        role: 'PIC'
      },
      {
        email: 'wr@wr.unikom.ac.id',
        password: 'secret',
        role: 'WakilRektor'
      },
      {
        email: 'direktorat@direktorat.unikom.ac.id',
        password: 'secret',
        role: 'Direktorat'
      }
    ])
  }
}
