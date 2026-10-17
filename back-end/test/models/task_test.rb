require "test_helper"

class TaskTest < ActiveSupport::TestCase
  test "is valid with title and subject" do
    assert Task.new(title: "Lista 2", subject: subjects(:one)).valid?
  end

  test "status defaults to pending" do
    assert_equal "pending", Task.new.status
  end

  test "is invalid without title" do
    task = Task.new(subject: subjects(:one))

    assert_not task.valid?
    assert_includes task.errors[:title], I18n.t("errors.messages.blank")
  end

  test "is invalid with an unknown status" do
    task = Task.new(title: "Lista 2", status: "abandonada", subject: subjects(:one))

    assert_not task.valid?
    assert task.errors[:status].any?
  end

  test "accepts every allowed status" do
    Task::STATUSES.each do |status|
      assert Task.new(title: "Lista 2", status: status, subject: subjects(:one)).valid?, "#{status} should be valid"
    end
  end

  test "is invalid without subject" do
    task = Task.new(title: "Lista 2")

    assert_not task.valid?
    assert task.errors[:subject].any?
  end
end
