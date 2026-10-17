require "test_helper"

class Api::V1::TasksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @headers = auth_headers(users(:ana))
    @task = tasks(:one)
  end

  test "index lists tasks" do
    get api_v1_tasks_url, headers: @headers, as: :json

    assert_response :success
    assert_equal users(:ana).tasks.count, response.parsed_body.size
  end

  test "index filters by subject_id" do
    get api_v1_tasks_url(subject_id: subjects(:one).id), headers: @headers, as: :json

    assert_response :success
    assert_equal [ @task.id ], response.parsed_body.map { |task| task["id"] }
  end

  test "index filters by status" do
    get api_v1_tasks_url(status: "completed"), headers: @headers, as: :json

    assert_response :success
    assert_equal [ tasks(:two).id ], response.parsed_body.map { |task| task["id"] }
  end

  test "show returns the task" do
    get api_v1_task_url(@task), headers: @headers, as: :json

    assert_response :success
    assert_equal "Lista de exercícios 1", response.parsed_body["title"]
  end

  test "show returns 404 for unknown id" do
    get api_v1_task_url(id: 0), headers: @headers, as: :json

    assert_response :not_found
  end

  test "create makes a new task linked to a subject" do
    assert_difference("Task.count", 1) do
      post api_v1_tasks_url,
        params: { task: { title: "Lista 2", due_date: "2026-11-15", subject_id: subjects(:one).id } },
        headers: @headers,
        as: :json
    end

    assert_response :created
    assert_equal "pending", response.parsed_body["status"]
  end

  test "create with invalid data returns 422 and errors" do
    assert_no_difference("Task.count") do
      post api_v1_tasks_url, params: { task: { title: "", subject_id: subjects(:one).id } }, headers: @headers, as: :json
    end

    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].any?
  end

  test "create with a nonexistent subject returns 422" do
    assert_no_difference("Task.count") do
      post api_v1_tasks_url, params: { task: { title: "Lista 2", subject_id: 0 } }, headers: @headers, as: :json
    end

    assert_response :unprocessable_entity
  end

  test "update changes the task" do
    patch api_v1_task_url(@task), params: { task: { status: "completed" } }, headers: @headers, as: :json

    assert_response :success
    assert_equal "completed", @task.reload.status
  end

  test "update with invalid status returns 422" do
    patch api_v1_task_url(@task), params: { task: { status: "abandonada" } }, headers: @headers, as: :json

    assert_response :unprocessable_entity
    assert_equal "pending", @task.reload.status
  end

  test "destroy removes the task" do
    assert_difference("Task.count", -1) do
      delete api_v1_task_url(@task), headers: @headers, as: :json
    end

    assert_response :no_content
  end

  test "requires login" do
    get api_v1_tasks_url, as: :json

    assert_response :unauthorized
  end

  test "index does not list tasks from other users" do
    get api_v1_tasks_url, headers: @headers, as: :json

    assert_not_includes response.parsed_body.map { |record| record["id"] }, tasks(:other).id
  end

  test "show returns 404 for another user's Task" do
    get api_v1_task_url(tasks(:other)), headers: @headers, as: :json

    assert_response :not_found
  end

  test "update returns 404 for another user's Task and keeps it unchanged" do
    patch api_v1_task_url(tasks(:other)), params: { task: { title: "Invadida" } }, headers: @headers, as: :json

    assert_response :not_found
    assert_not_equal "Invadida", tasks(:other).reload.title
  end

  test "destroy returns 404 for another user's Task" do
    assert_no_difference("Task.count") do
      delete api_v1_task_url(tasks(:other)), headers: @headers, as: :json
    end

    assert_response :not_found
  end

  test "create in another user's subject is refused" do
    assert_no_difference("Task.count") do
      post api_v1_tasks_url,
        params: { task: { title: "Invasora", subject_id: subjects(:other).id } },
        headers: @headers,
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "update cannot move a Task to another user's subject" do
    record = tasks(:one)

    patch api_v1_task_url(record), params: { task: { subject_id: subjects(:other).id } }, headers: @headers, as: :json

    assert_response :unprocessable_entity
    assert_equal subjects(:one), record.reload.subject
  end
end
