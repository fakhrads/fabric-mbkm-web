import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ProfileMahasiswa extends BaseModel {
  static get table () {
    return 'profile_mahasiswa'
  }

  @column({ isPrimary: true })
  public id: number
  
  @column()
  public user_id: number

  @column()
  public nim: string

  @column()
  public nik: string

  @column()
  public telepon: string

  @column()
  public nama_lengkap: string

  @column()
  public tanggal_lahir: string

  @column()
  public tempat_lahir: string

  @column()
  public kota_domisili: string

  @column()
  public provinsi_domisili: string

  @column()
  public nama_wali: string

  @column()
  public fakultas: string

  @column()
  public program_studi: string

  @column()
  public jenjang: string

  @column()
  public jumlah_sks: string

  @column()
  public semester: string

  @column()
  public ipk: string

  @column()
  public transkrip: string | undefined

  @column()
  public beasiswa: string | undefined

  @column()
  public jumlah_beasiswa: string | undefined

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
