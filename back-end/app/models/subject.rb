class Subject < ApplicationRecord
  has_many :tasks, dependent: :destroy
  has_many :note, dependent: :destroy
  has_many :exam, dependent: :destroy
end
