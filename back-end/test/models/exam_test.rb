require "test_helper"

class ExamTest < ActiveSupport::TestCase
  test "is valid with name, date and subject" do
    assert Exam.new(name: "Prova 1", date: Date.new(2026, 11, 20), subject: subjects(:one)).valid?
  end

  test "grade is optional" do
    assert Exam.new(name: "Prova 1", date: Date.new(2026, 11, 20), grade: nil, subject: subjects(:one)).valid?
  end

  test "is invalid without name" do
    exam = Exam.new(date: Date.new(2026, 11, 20), subject: subjects(:one))

    assert_not exam.valid?
    assert_includes exam.errors[:name], I18n.t("errors.messages.blank")
  end

  test "is invalid without date" do
    exam = Exam.new(name: "Prova 1", subject: subjects(:one))

    assert_not exam.valid?
    assert_includes exam.errors[:date], I18n.t("errors.messages.blank")
  end

  test "grade must be between 0 and 10" do
    too_high = Exam.new(name: "Prova 1", date: Date.new(2026, 11, 20), grade: 10.5, subject: subjects(:one))
    negative = Exam.new(name: "Prova 1", date: Date.new(2026, 11, 20), grade: -1, subject: subjects(:one))

    assert_not too_high.valid?
    assert_not negative.valid?
  end

  test "is invalid without subject" do
    exam = Exam.new(name: "Prova 1", date: Date.new(2026, 11, 20))

    assert_not exam.valid?
    assert exam.errors[:subject].any?
  end
end
