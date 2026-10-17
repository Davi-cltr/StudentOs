class ApplicationController < ActionController::API
  # Tudo exige login, exceto o que declarar `skip_before_action :authenticate!`.
  before_action :authenticate!

  rescue_from ActiveRecord::RecordNotFound do
    render json: { errors: [ "Registro não encontrado" ] }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |error|
    render json: { errors: [ error.message ] }, status: :bad_request
  end

  private

    attr_reader :current_user, :current_auth_token

    def authenticate!
      auth_token = AuthToken.authenticate(bearer_token)
      return render_unauthorized unless auth_token

      @current_auth_token = auth_token
      @current_user = auth_token.user
    end

    # Cabeçalho esperado: Authorization: Bearer <token>
    def bearer_token
      request.authorization.to_s[/\ABearer (.+)\z/, 1]
    end

    def render_unauthorized
      render json: { errors: [ "Faça login para continuar." ] }, status: :unauthorized
    end

    # Abre uma sessão para o usuário e responde com o token e os dados públicos dele.
    def render_session(user, status: :ok)
      _record, token = AuthToken.issue_for(user)
      render json: { token: token, user: user.public_attributes }, status: status
    end

    # Tarefas, provas e anotações pertencem a uma matéria. Troca o subject_id enviado
    # pela matéria do usuário logado; se a matéria não for dele (ou não existir), o
    # valor vira nil e a validação do modelo recusa ("Matéria precisa existir").
    def with_owned_subject(attrs)
      attrs = attrs.to_h
      return attrs unless attrs.key?("subject_id")

      attrs.except("subject_id").merge("subject" => current_user.subjects.find_by(id: attrs["subject_id"]))
    end
end
