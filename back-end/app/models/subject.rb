class Subject < ApplicationRecord
  belongs_to :user

  has_many :tasks, dependent: :destroy
  has_many :exams, dependent: :destroy
  has_many :notes, dependent: :destroy

  validates :name, presence: true
  validates :teacher, presence: true
end
