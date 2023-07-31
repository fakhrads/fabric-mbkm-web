import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ProfileMitra extends BaseModel {
  static get table () {
    return 'profile_mitra'
  }

  @column({ isPrimary: true })
  public id: number
  
  @column()
  public user_id: number

  @column()
  public kode_mitra: string

  @column()
  public nama_mitra: string

  @column()
  public lokasi_mitra: string

  @column()
  public deskripsi_mitra: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
