class AuthToken < ApplicationRecord
  LIFETIME = 30.days

  belongs_to :user

  scope :expired, -> { where("expires_at <= ?", Time.current) }

  # Cria um token novo para o usuário e devolve [registro, token].
  # O token em texto puro só existe neste momento: no banco fica apenas o hash.
  def self.issue_for(user)
    token = SecureRandom.urlsafe_base64(32)
    record = user.auth_tokens.create!(token_digest: digest(token), expires_at: LIFETIME.from_now)
    [ record, token ]
  end

  # Devolve o registro de um token válido (existente e não expirado), ou nil.
  def self.authenticate(token)
    return if token.blank?

    where("expires_at > ?", Time.current).find_by(token_digest: digest(token))
  end

  def self.digest(token)
    OpenSSL::Digest::SHA256.hexdigest(token)
  end
end
