class Api::V1::SubjectsController < ApplicationController
  def index
    subjects = Subject.all

    render json: subjects
  end

  def show 
    subject = Subject.find(params[:id])

    render json: subject
  end

  def create
    subject = Subject.new(subject_params)

    if subject.save
      render json: subject, status: :created
    else
      render json: { errors: subject.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update 
    subject = Subject.find(params[:id])

    if subject.update(subject_params)
      render json: subject
    else 
      render json: { errors: subject.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy 
    subject = Subject.find(params[:id])

    subject.destroy

    head :no_content
  end

  private

  def subject_params
    params.require(:subject).permit(:name, :teacher)
  end
end
