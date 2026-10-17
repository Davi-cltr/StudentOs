require "test_helper"

class Api::V1::ExamsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @headers = auth_headers(users(:ana))
    @exam = exams(:one)
  end

  test "index lists exams" do
    get api_v1_exams_url, headers: @headers, as: :json

    assert_response :success
    assert_equal users(:ana).exams.count, response.parsed_body.size
  end

  test "index filters by subject_id" do
    get api_v1_exams_url(subject_id: subjects(:one).id), headers: @headers, as: :json

    assert_response :success
    assert_equal [ @exam.id ], response.parsed_body.map { |exam| exam["id"] }
  end

  test "show returns the exam" do
    get api_v1_exam_url(@exam), headers: @headers, as: :json

    assert_response :success
    assert_equal "Prova bimestral", response.parsed_body["name"]
  end

  test "show returns 404 for unknown id" do
    get api_v1_exam_url(id: 0), headers: @headers, as: :json

    assert_response :not_found
  end

  test "create makes a new exam" do
    assert_difference("Exam.count", 1) do
      post api_v1_exams_url,
        params: { exam: { name: "Prova 2", date: "2026-12-01", subject_id: subjects(:two).id } },
        headers: @headers,
        as: :json
    end

    assert_response :created
  end

  test "create with invalid data returns 422 and errors" do
    assert_no_difference("Exam.count") do
      post api_v1_exams_url,
        params: { exam: { name: "Prova 2", date: "2026-12-01", grade: 11, subject_id: subjects(:two).id } },
        headers: @headers,
        as: :json
    end

    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].any?
  end

  test "update registers the grade" do
    patch api_v1_exam_url(@exam), params: { exam: { grade: 7.5 } }, headers: @headers, as: :json

    assert_response :success
    assert_equal 7.5, @exam.reload.grade.to_f
  end

  test "update with invalid data returns 422" do
    patch api_v1_exam_url(@exam), params: { exam: { name: "" } }, headers: @headers, as: :json

    assert_response :unprocessable_entity
  end

  test "destroy removes the exam" do
    assert_difference("Exam.count", -1) do
      delete api_v1_exam_url(@exam), headers: @headers, as: :json
    end

    assert_response :no_content
  end

  test "requires login" do
    get api_v1_exams_url, as: :json

    assert_response :unauthorized
  end

  test "index does not list exams from other users" do
    get api_v1_exams_url, headers: @headers, as: :json

    assert_not_includes response.parsed_body.map { |record| record["id"] }, exams(:other).id
  end

  test "show returns 404 for another user's Exam" do
    get api_v1_exam_url(exams(:other)), headers: @headers, as: :json

    assert_response :not_found
  end

  test "update returns 404 for another user's Exam and keeps it unchanged" do
    patch api_v1_exam_url(exams(:other)), params: { exam: { name: "Invadida" } }, headers: @headers, as: :json

    assert_response :not_found
    assert_not_equal "Invadida", exams(:other).reload.name
  end

  test "destroy returns 404 for another user's Exam" do
    assert_no_difference("Exam.count") do
      delete api_v1_exam_url(exams(:other)), headers: @headers, as: :json
    end

    assert_response :not_found
  end

  test "create in another user's subject is refused" do
    assert_no_difference("Exam.count") do
      post api_v1_exams_url,
        params: { exam: { name: "Invasora", date: "2026-12-01", subject_id: subjects(:other).id } },
        headers: @headers,
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "update cannot move a Exam to another user's subject" do
    record = exams(:one)

    patch api_v1_exam_url(record), params: { exam: { subject_id: subjects(:other).id } }, headers: @headers, as: :json

    assert_response :unprocessable_entity
    assert_equal subjects(:one), record.reload.subject
  end
end
