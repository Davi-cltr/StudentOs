class Task < ApplicationRecord
  STATUSES = %w[ pending in_progress completed ].freeze

  belongs_to :subject

  attribute :status, :string, default: "pending"

  validates :title, presence: true
  validates :status, inclusion: { in: STATUSES }
end
