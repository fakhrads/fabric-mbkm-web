import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ProfileDosen extends BaseModel {
  static get table () {
    return 'profile_dosen'
  }

  @column({ isPrimary: true })
  public id: number
  
  @column()
  public user_id: number

  @column()
  public nip: string

  @column()
  public nama_dosen: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
