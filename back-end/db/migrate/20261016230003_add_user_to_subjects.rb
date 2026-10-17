class AddUserToSubjects < ActiveRecord::Migration[7.2]
  # A coluna aceita nulo porque já podem existir matérias criadas antes do login.
  # Novas matérias exigem dono (validação no modelo). Para atribuir as antigas a
  # alguém, use: bin/rails "studentos:claim_orphans[email@exemplo.com]"
  def change
    add_reference :subjects, :user, foreign_key: true
  end
end
