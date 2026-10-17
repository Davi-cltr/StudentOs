class Api::V1::NotesController < ApplicationController
  before_action :set_note, only: %i[ show update destroy ]

  # GET /api/v1/notes
  # Filtro opcional: ?subject_id=1
  def index
    notes = current_user.notes.order(created_at: :desc)
    notes = notes.where(subject_id: params[:subject_id]) if params[:subject_id].present?

    render json: notes
  end

  def show
    render json: @note
  end

  def create
    note = Note.new(with_owned_subject(note_params))

    if note.save
      render json: note, status: :created
    else
      render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @note.update(with_owned_subject(note_params))
      render json: @note
    else
      render json: { errors: @note.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @note.destroy

    head :no_content
  end

  private

    def set_note
      @note = current_user.notes.find(params[:id])
    end

    def note_params
      params.require(:note).permit(:title, :content, :subject_id)
    end
end
