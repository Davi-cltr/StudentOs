require "test_helper"

class Api::V1::NotesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @headers = auth_headers(users(:ana))
    @note = notes(:one)
  end

  test "index lists notes" do
    get api_v1_notes_url, headers: @headers, as: :json

    assert_response :success
    assert_equal users(:ana).notes.count, response.parsed_body.size
  end

  test "index filters by subject_id" do
    get api_v1_notes_url(subject_id: subjects(:one).id), headers: @headers, as: :json

    assert_response :success
    assert_equal [ @note.id ], response.parsed_body.map { |note| note["id"] }
  end

  test "show returns the note" do
    get api_v1_note_url(@note), headers: @headers, as: :json

    assert_response :success
    assert_equal "Fórmulas de Bhaskara", response.parsed_body["title"]
  end

  test "show returns 404 for unknown id" do
    get api_v1_note_url(id: 0), headers: @headers, as: :json

    assert_response :not_found
  end

  test "create makes a new note" do
    assert_difference("Note.count", 1) do
      post api_v1_notes_url,
        params: { note: { title: "Resumo", content: "Texto", subject_id: subjects(:one).id } },
        headers: @headers,
        as: :json
    end

    assert_response :created
  end

  test "create with invalid data returns 422 and errors" do
    assert_no_difference("Note.count") do
      post api_v1_notes_url,
        params: { note: { title: "", content: "", subject_id: subjects(:one).id } },
        headers: @headers,
        as: :json
    end

    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].any?
  end

  test "update changes the note" do
    patch api_v1_note_url(@note), params: { note: { content: "Novo texto" } }, headers: @headers, as: :json

    assert_response :success
    assert_equal "Novo texto", @note.reload.content
  end

  test "update with invalid data returns 422" do
    patch api_v1_note_url(@note), params: { note: { title: "" } }, headers: @headers, as: :json

    assert_response :unprocessable_entity
  end

  test "destroy removes the note" do
    assert_difference("Note.count", -1) do
      delete api_v1_note_url(@note), headers: @headers, as: :json
    end

    assert_response :no_content
  end

  test "requires login" do
    get api_v1_notes_url, as: :json

    assert_response :unauthorized
  end

  test "index does not list notes from other users" do
    get api_v1_notes_url, headers: @headers, as: :json

    assert_not_includes response.parsed_body.map { |record| record["id"] }, notes(:other).id
  end

  test "show returns 404 for another user's Note" do
    get api_v1_note_url(notes(:other)), headers: @headers, as: :json

    assert_response :not_found
  end

  test "update returns 404 for another user's Note and keeps it unchanged" do
    patch api_v1_note_url(notes(:other)), params: { note: { title: "Invadida" } }, headers: @headers, as: :json

    assert_response :not_found
    assert_not_equal "Invadida", notes(:other).reload.title
  end

  test "destroy returns 404 for another user's Note" do
    assert_no_difference("Note.count") do
      delete api_v1_note_url(notes(:other)), headers: @headers, as: :json
    end

    assert_response :not_found
  end

  test "create in another user's subject is refused" do
    assert_no_difference("Note.count") do
      post api_v1_notes_url,
        params: { note: { title: "Invasora", content: "Texto", subject_id: subjects(:other).id } },
        headers: @headers,
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "update cannot move a Note to another user's subject" do
    record = notes(:one)

    patch api_v1_note_url(record), params: { note: { subject_id: subjects(:other).id } }, headers: @headers, as: :json

    assert_response :unprocessable_entity
    assert_equal subjects(:one), record.reload.subject
  end
end
