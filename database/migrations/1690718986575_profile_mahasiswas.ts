import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'profile_mahasiswa'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')
      table.string("nim", 255).notNullable()
      table.string("nama_lengkap", 255).notNullable()
      table.string("tanggal_lahir", 255).notNullable()
      table.string("fakultas", 150).notNullable()
      table.string("program_studi", 100).notNullable()
      table.string("jumlah_sks", 100).notNullable()
      table.string("ipk", 100).notNullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
