class Exam < ApplicationRecord
  belongs_to :subject

  validates :name, presence: true
  validates :date, presence: true
  validates :subject_id, presence: true
end