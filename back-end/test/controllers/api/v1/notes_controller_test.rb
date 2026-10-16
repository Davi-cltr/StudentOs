require "test_helper"

class Api::V1::NotesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @note = notes(:one)
  end

  test "index lists notes" do
    get api_v1_notes_url, as: :json

    assert_response :success
    assert_equal Note.count, response.parsed_body.size
  end

  test "index filters by subject_id" do
    get api_v1_notes_url(subject_id: subjects(:one).id), as: :json

    assert_response :success
    assert_equal [ @note.id ], response.parsed_body.map { |note| note["id"] }
  end

  test "show returns the note" do
    get api_v1_note_url(@note), as: :json

    assert_response :success
    assert_equal "Fórmulas de Bhaskara", response.parsed_body["title"]
  end

  test "show returns 404 for unknown id" do
    get api_v1_note_url(id: 0), as: :json

    assert_response :not_found
  end

  test "create makes a new note" do
    assert_difference("Note.count", 1) do
      post api_v1_notes_url,
        params: { note: { title: "Resumo", content: "Texto", subject_id: subjects(:one).id } },
        as: :json
    end

    assert_response :created
  end

  test "create with invalid data returns 422 and errors" do
    assert_no_difference("Note.count") do
      post api_v1_notes_url,
        params: { note: { title: "", content: "", subject_id: subjects(:one).id } },
        as: :json
    end

    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].any?
  end

  test "update changes the note" do
    patch api_v1_note_url(@note), params: { note: { content: "Novo texto" } }, as: :json

    assert_response :success
    assert_equal "Novo texto", @note.reload.content
  end

  test "update with invalid data returns 422" do
    patch api_v1_note_url(@note), params: { note: { title: "" } }, as: :json

    assert_response :unprocessable_entity
  end

  test "destroy removes the note" do
    assert_difference("Note.count", -1) do
      delete api_v1_note_url(@note), as: :json
    end

    assert_response :no_content
  end
end
