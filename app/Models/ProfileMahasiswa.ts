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
  public nama_lengkap: string

  @column()
  public tanggal_lahir: string

  @column()
  public fakultas: string

  @column()
  public program_studi: string

  @column()
  public jumlah_sks: string

  @column()
  public ipk: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
