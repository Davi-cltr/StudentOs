require "test_helper"

class Api::V1::SubjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @headers = auth_headers(users(:ana))
    @subject = subjects(:one)
  end

  test "index lists subjects" do
    get api_v1_subjects_url, headers: @headers, as: :json

    assert_response :success
    assert_equal users(:ana).subjects.count, response.parsed_body.size
  end

  test "show returns the subject" do
    get api_v1_subject_url(@subject), headers: @headers, as: :json

    assert_response :success
    assert_equal "Matemática", response.parsed_body["name"]
  end

  test "show returns 404 for unknown id" do
    get api_v1_subject_url(id: 0), headers: @headers, as: :json

    assert_response :not_found
  end

  test "create makes a new subject" do
    assert_difference("Subject.count", 1) do
      post api_v1_subjects_url, params: { subject: { name: "Física", teacher: "Marcos" } }, headers: @headers, as: :json
    end

    assert_response :created
  end

  test "create with invalid data returns 422 and errors" do
    assert_no_difference("Subject.count") do
      post api_v1_subjects_url, params: { subject: { name: "", teacher: "" } }, headers: @headers, as: :json
    end

    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].any?
  end

  test "create without the subject key returns 400" do
    post api_v1_subjects_url, params: {}, headers: @headers, as: :json

    assert_response :bad_request
  end

  test "update changes the subject" do
    patch api_v1_subject_url(@subject), params: { subject: { name: "Álgebra" } }, headers: @headers, as: :json

    assert_response :success
    assert_equal "Álgebra", @subject.reload.name
  end

  test "update with invalid data returns 422 and keeps the record" do
    patch api_v1_subject_url(@subject), params: { subject: { name: "" } }, headers: @headers, as: :json

    assert_response :unprocessable_entity
    assert_equal "Matemática", @subject.reload.name
  end

  test "destroy removes the subject" do
    assert_difference("Subject.count", -1) do
      delete api_v1_subject_url(@subject), headers: @headers, as: :json
    end

    assert_response :no_content
  end

  test "requires login" do
    get api_v1_subjects_url, as: :json

    assert_response :unauthorized
  end

  test "index does not list subjects from other users" do
    get api_v1_subjects_url, headers: @headers, as: :json

    assert_not_includes response.parsed_body.map { |subject| subject["id"] }, subjects(:other).id
  end

  test "show returns 404 for another user's subject" do
    get api_v1_subject_url(subjects(:other)), headers: @headers, as: :json

    assert_response :not_found
  end

  test "update returns 404 for another user's subject and keeps it unchanged" do
    patch api_v1_subject_url(subjects(:other)), params: { subject: { name: "Invadida" } }, headers: @headers, as: :json

    assert_response :not_found
    assert_equal "Física", subjects(:other).reload.name
  end

  test "destroy returns 404 for another user's subject" do
    assert_no_difference("Subject.count") do
      delete api_v1_subject_url(subjects(:other)), headers: @headers, as: :json
    end

    assert_response :not_found
  end

  test "create assigns the subject to the logged in user" do
    post api_v1_subjects_url, params: { subject: { name: "Química", teacher: "Rita" } }, headers: @headers, as: :json

    assert_equal users(:ana), Subject.find(response.parsed_body["id"]).user
  end
end
