class Api::V1::RegistrationsController < ApplicationController
  skip_before_action :authenticate!, only: :create

  # POST /api/v1/signup
  def create
    user = User.new(registration_params)

    if user.save
      render_session(user, status: :created)
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

    def registration_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
end
