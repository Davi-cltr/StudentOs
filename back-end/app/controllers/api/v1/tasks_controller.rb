class Api::V1::TasksController < ApplicationController
  before_action :set_task, only: %i[ show update destroy ]

  # GET /api/v1/tasks
  # Filtros opcionais: ?subject_id=1 e ?status=pending
  def index
    tasks = Task.order(:due_date)
    tasks = tasks.where(subject_id: params[:subject_id]) if params[:subject_id].present?
    tasks = tasks.where(status: params[:status]) if params[:status].present?

    render json: tasks
  end

  def show
    render json: @task
  end

  def create
    task = Task.new(task_params)

    if task.save
      render json: task, status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @task.update(task_params)
      render json: @task
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @task.destroy

    head :no_content
  end

  private

    def set_task
      @task = Task.find(params[:id])
    end

    def task_params
      params.require(:task).permit(:title, :description, :status, :due_date, :subject_id)
    end
end
