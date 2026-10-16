require "test_helper"

class NoteTest < ActiveSupport::TestCase
  test "is valid with title, content and subject" do
    assert Note.new(title: "Resumo", content: "Texto", subject: subjects(:one)).valid?
  end

  test "is invalid without title" do
    note = Note.new(content: "Texto", subject: subjects(:one))

    assert_not note.valid?
    assert_includes note.errors[:title], "can't be blank"
  end

  test "is invalid without content" do
    note = Note.new(title: "Resumo", subject: subjects(:one))

    assert_not note.valid?
    assert_includes note.errors[:content], "can't be blank"
  end

  test "is invalid without subject" do
    note = Note.new(title: "Resumo", content: "Texto")

    assert_not note.valid?
    assert note.errors[:subject].any?
  end
end
