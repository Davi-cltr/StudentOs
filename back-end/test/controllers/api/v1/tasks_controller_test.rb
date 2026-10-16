require "test_helper"

class Api::V1::TasksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @task = tasks(:one)
  end

  test "index lists tasks" do
    get api_v1_tasks_url, as: :json

    assert_response :success
    assert_equal Task.count, response.parsed_body.size
  end

  test "index filters by subject_id" do
    get api_v1_tasks_url(subject_id: subjects(:one).id), as: :json

    assert_response :success
    assert_equal [ @task.id ], response.parsed_body.map { |task| task["id"] }
  end

  test "index filters by status" do
    get api_v1_tasks_url(status: "completed"), as: :json

    assert_response :success
    assert_equal [ tasks(:two).id ], response.parsed_body.map { |task| task["id"] }
  end

  test "show returns the task" do
    get api_v1_task_url(@task), as: :json

    assert_response :success
    assert_equal "Lista de exercícios 1", response.parsed_body["title"]
  end

  test "show returns 404 for unknown id" do
    get api_v1_task_url(id: 0), as: :json

    assert_response :not_found
  end

  test "create makes a new task linked to a subject" do
    assert_difference("Task.count", 1) do
      post api_v1_tasks_url,
        params: { task: { title: "Lista 2", due_date: "2026-11-15", subject_id: subjects(:one).id } },
        as: :json
    end

    assert_response :created
    assert_equal "pending", response.parsed_body["status"]
  end

  test "create with invalid data returns 422 and errors" do
    assert_no_difference("Task.count") do
      post api_v1_tasks_url, params: { task: { title: "", subject_id: subjects(:one).id } }, as: :json
    end

    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].any?
  end

  test "create with a nonexistent subject returns 422" do
    assert_no_difference("Task.count") do
      post api_v1_tasks_url, params: { task: { title: "Lista 2", subject_id: 0 } }, as: :json
    end

    assert_response :unprocessable_entity
  end

  test "update changes the task" do
    patch api_v1_task_url(@task), params: { task: { status: "completed" } }, as: :json

    assert_response :success
    assert_equal "completed", @task.reload.status
  end

  test "update with invalid status returns 422" do
    patch api_v1_task_url(@task), params: { task: { status: "abandonada" } }, as: :json

    assert_response :unprocessable_entity
    assert_equal "pending", @task.reload.status
  end

  test "destroy removes the task" do
    assert_difference("Task.count", -1) do
      delete api_v1_task_url(@task), as: :json
    end

    assert_response :no_content
  end
end
