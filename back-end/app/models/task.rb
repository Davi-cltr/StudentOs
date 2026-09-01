class Task < ApplicationRecord
  belongs_to :subject

  validates :title, presence: true
  validates :status, presence: true
  validates :due_date, presence: true
end
