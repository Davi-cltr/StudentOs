class Api::V1::ExamsController < ApplicationController

  def index
    exams = Exam.all

    render json: exams
  end

  def show
    exam = Exam.find(params[:id])

    render json: exam
  end

  def create
    exam = Exam.new(exam_params)

    if exam.save
      render json: exam, status: :created
    else
      render json: { errors: exam.errors.full_messages },
            status: :unprocessable_entity
    end
  end

  def update
    exam = Exam.find(params[:id])

    if exam.update(exam_params)
      render json: exam
    else
      render json: { errors: exam.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  def destroy
    exam = Exam.find(params[:id])

    exam.destroy

    head :no_content
  end

private

def exam_params
  params.require(:exam).permit(
    :name,
    :date,
    :grade,
    :subject_id
  )
end

end