namespace :studentos do
  desc "Atribui a um usuário as matérias criadas antes do login (sem dono): rake studentos:claim_orphans[email]"
  task :claim_orphans, [ :email ] => :environment do |_task, args|
    user = User.find_by(email: args[:email].to_s.strip.downcase)
    abort "Usuário não encontrado: #{args[:email].inspect}" unless user

    count = Subject.where(user_id: nil).update_all(user_id: user.id)
    puts "#{count} matéria(s) atribuída(s) a #{user.email}."
  end
end
