require "test_helper"

class Api::V1::SubjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @subject = subjects(:one)
  end

  test "index lists subjects" do
    get api_v1_subjects_url, as: :json

    assert_response :success
    assert_equal Subject.count, response.parsed_body.size
  end

  test "show returns the subject" do
    get api_v1_subject_url(@subject), as: :json

    assert_response :success
    assert_equal "Matemática", response.parsed_body["name"]
  end

  test "show returns 404 for unknown id" do
    get api_v1_subject_url(id: 0), as: :json

    assert_response :not_found
  end

  test "create makes a new subject" do
    assert_difference("Subject.count", 1) do
      post api_v1_subjects_url, params: { subject: { name: "Física", teacher: "Marcos" } }, as: :json
    end

    assert_response :created
  end

  test "create with invalid data returns 422 and errors" do
    assert_no_difference("Subject.count") do
      post api_v1_subjects_url, params: { subject: { name: "", teacher: "" } }, as: :json
    end

    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].any?
  end

  test "create without the subject key returns 400" do
    post api_v1_subjects_url, params: {}, as: :json

    assert_response :bad_request
  end

  test "update changes the subject" do
    patch api_v1_subject_url(@subject), params: { subject: { name: "Álgebra" } }, as: :json

    assert_response :success
    assert_equal "Álgebra", @subject.reload.name
  end

  test "update with invalid data returns 422 and keeps the record" do
    patch api_v1_subject_url(@subject), params: { subject: { name: "" } }, as: :json

    assert_response :unprocessable_entity
    assert_equal "Matemática", @subject.reload.name
  end

  test "destroy removes the subject" do
    assert_difference("Subject.count", -1) do
      delete api_v1_subject_url(@subject), as: :json
    end

    assert_response :no_content
  end
end
