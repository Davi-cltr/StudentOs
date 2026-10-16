require "test_helper"

class SubjectTest < ActiveSupport::TestCase
  test "is valid with name and teacher" do
    assert Subject.new(name: "Física", teacher: "Marcos").valid?
  end

  test "is invalid without name" do
    subject = Subject.new(teacher: "Marcos")

    assert_not subject.valid?
    assert_includes subject.errors[:name], "can't be blank"
  end

  test "is invalid without teacher" do
    subject = Subject.new(name: "Física")

    assert_not subject.valid?
    assert_includes subject.errors[:teacher], "can't be blank"
  end

  test "destroying a subject destroys its tasks, exams and notes" do
    subject = subjects(:one)

    assert_difference [ "Task.count", "Exam.count", "Note.count" ], -1 do
      subject.destroy
    end
  end
end
