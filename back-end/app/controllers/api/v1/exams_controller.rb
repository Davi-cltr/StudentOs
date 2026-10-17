class Api::V1::ExamsController < ApplicationController
  before_action :set_exam, only: %i[ show update destroy ]

  # GET /api/v1/exams
  # Filtro opcional: ?subject_id=1
  def index
    exams = current_user.exams.order(:date)
    exams = exams.where(subject_id: params[:subject_id]) if params[:subject_id].present?

    render json: exams
  end

  def show
    render json: @exam
  end

  def create
    exam = Exam.new(with_owned_subject(exam_params))

    if exam.save
      render json: exam, status: :created
    else
      render json: { errors: exam.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @exam.update(with_owned_subject(exam_params))
      render json: @exam
    else
      render json: { errors: @exam.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @exam.destroy

    head :no_content
  end

  private

    def set_exam
      @exam = current_user.exams.find(params[:id])
    end

    def exam_params
      params.require(:exam).permit(:name, :date, :grade, :subject_id)
    end
end
