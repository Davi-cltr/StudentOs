class CreateAuthTokens < ActiveRecord::Migration[7.2]
  def change
    create_table :auth_tokens do |t|
      t.references :user, null: false, foreign_key: true
      # Guardamos só o hash (SHA-256) do token: se o banco vazar, os tokens não servem.
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end
    add_index :auth_tokens, :token_digest, unique: true
  end
end
