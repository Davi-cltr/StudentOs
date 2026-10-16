class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do
    render json: { errors: [ "Registro não encontrado" ] }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |error|
    render json: { errors: [ error.message ] }, status: :bad_request
  end
end
