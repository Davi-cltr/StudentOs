class Api::V1::SubjectsController < ApplicationController
  before_action :set_subject, only: %i[ show update destroy ]

  def index
    render json: Subject.order(:name)
  end

  def show
    render json: @subject
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
    if @subject.update(subject_params)
      render json: @subject
    else
      render json: { errors: @subject.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @subject.destroy

    head :no_content
  end

  private

    def set_subject
      @subject = Subject.find(params[:id])
    end

    def subject_params
      params.require(:subject).permit(:name, :teacher)
    end
end
