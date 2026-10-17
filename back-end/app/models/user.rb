class User < ApplicationRecord
  has_secure_password

  has_many :auth_tokens, dependent: :destroy
  has_many :subjects, dependent: :destroy
  has_many :tasks, through: :subjects
  has_many :exams, through: :subjects
  has_many :notes, through: :subjects

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }, uniqueness: true
  validates :password, length: { minimum: 8 }, allow_nil: true

  # O que pode ser enviado ao cliente. Nunca use `render json: user` diretamente:
  # isso incluiria o password_digest.
  def public_attributes
    slice(:id, :name, :email)
  end
end
