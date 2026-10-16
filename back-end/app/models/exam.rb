class Exam < ApplicationRecord
  belongs_to :subject

  validates :name, presence: true
  validates :date, presence: true
  # A nota é opcional (a prova pode ainda não ter acontecido) e vai de 0 a 10.
  validates :grade, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 10 }, allow_nil: true
end
