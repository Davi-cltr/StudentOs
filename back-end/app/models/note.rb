class Note < ApplicationRecord
  belongs_to :subject

  validates :title, presence: true
  validates :content, presence: true
end
