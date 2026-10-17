class Api::V1::SessionsController < ApplicationController
  skip_before_action :authenticate!, only: :create

  # POST /api/v1/login
  def create
    user = User.find_by(email: params[:email].to_s.strip.downcase)

    if user&.authenticate(params[:password].to_s)
      AuthToken.expired.delete_all
      render_session(user)
    else
      render json: { errors: [ "E-mail ou senha incorretos." ] }, status: :unauthorized
    end
  end

  # GET /api/v1/me
  def show
    render json: current_user.public_attributes
  end

  # DELETE /api/v1/logout
  def destroy
    current_auth_token.destroy
    head :no_content
  end
end
