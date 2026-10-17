require "test_helper"

class UserTest < ActiveSupport::TestCase
  def build(attrs = {})
    User.new({ name: "Carla Dias", email: "carla@example.com", password: "senha1234" }.merge(attrs))
  end

  test "is valid with name, email and password" do
    assert build.valid?
  end

  test "is invalid without name" do
    user = build(name: "")

    assert_not user.valid?
    assert_includes user.errors[:name], I18n.t("errors.messages.blank")
  end

  test "is invalid with a malformed email" do
    assert_not build(email: "sem-arroba").valid?
  end

  test "email is unique regardless of case" do
    assert_not build(email: "ANA@EXAMPLE.COM").valid?
  end

  test "email is normalized" do
    assert_equal "carla@example.com", build(email: "  Carla@Example.COM ").email
  end

  test "password needs at least 8 characters" do
    assert_not build(password: "1234567").valid?
    assert build(password: "12345678").valid?
  end

  test "password is required" do
    assert_not build(password: nil).valid?
  end

  test "authenticate checks the password" do
    assert users(:ana).authenticate("senha1234")
    assert_not users(:ana).authenticate("errada")
  end

  test "public_attributes never includes the password digest" do
    assert_equal %w[ email id name ], users(:ana).public_attributes.keys.sort
  end

  test "destroying a user destroys their subjects and tokens" do
    2.times { AuthToken.issue_for(users(:ana)) }

    assert_difference [ "Subject.count", "AuthToken.count" ], -2 do
      users(:ana).destroy
    end
  end

  test "a user only reaches their own tasks, exams and notes" do
    assert_equal [ tasks(:one), tasks(:two) ].sort_by(&:id), users(:ana).tasks.sort_by(&:id)
    assert_equal [ tasks(:other) ], users(:bruno).tasks.to_a
    assert_equal [ exams(:other) ], users(:bruno).exams.to_a
    assert_equal [ notes(:other) ], users(:bruno).notes.to_a
  end
end
