require "test_helper"

class Api::V1::AuthTest < ActionDispatch::IntegrationTest
  PASSWORD = "senha1234".freeze

  def signup(attrs = {})
    user = { name: "Carla Dias", email: "carla@example.com", password: PASSWORD, password_confirmation: PASSWORD }.merge(attrs)
    post api_v1_signup_url, params: { user: user }, as: :json
  end

  def login(email: "ana@example.com", password: PASSWORD)
    post api_v1_login_url, params: { email: email, password: password }, as: :json
  end

  def bearer(token)
    { "Authorization" => "Bearer #{token}" }
  end

  # ---------- cadastro

  test "signup creates the user and returns a working token" do
    assert_difference("User.count", 1) { signup }

    assert_response :created
    token = response.parsed_body["token"]
    assert token.present?
    assert_equal "carla@example.com", response.parsed_body.dig("user", "email")

    get api_v1_me_url, headers: bearer(token), as: :json
    assert_response :success
    assert_equal "Carla Dias", response.parsed_body["name"]
  end

  test "signup never exposes the password or its digest" do
    signup

    assert_no_match(/password/, response.body)
  end

  test "signup normalizes the email" do
    signup(email: "  Carla@Example.COM ")

    assert_response :created
    assert_equal "carla@example.com", User.last.email
  end

  test "signup refuses a duplicated email, ignoring case" do
    assert_no_difference("User.count") { signup(email: "ANA@example.com") }

    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"].join, I18n.t("errors.messages.taken")
  end

  test "signup refuses a short password" do
    assert_no_difference("User.count") { signup(password: "curta", password_confirmation: "curta") }

    assert_response :unprocessable_entity
  end

  test "signup refuses a wrong confirmation" do
    assert_no_difference("User.count") { signup(password_confirmation: "outra-senha") }

    assert_response :unprocessable_entity
  end

  test "signup refuses an invalid email and a blank name" do
    assert_no_difference("User.count") { signup(email: "sem-arroba", name: "") }

    assert_response :unprocessable_entity
    assert_operator response.parsed_body["errors"].size, :>=, 2
  end

  test "signup error messages are in Portuguese" do
    signup(name: "")

    assert_includes response.parsed_body["errors"], "Nome #{I18n.t('errors.messages.blank')}"
  end

  # ---------- login

  test "login returns a token and the public user data" do
    login

    assert_response :success
    assert response.parsed_body["token"].present?
    assert_equal({ "id" => users(:ana).id, "name" => "Ana Souza", "email" => "ana@example.com" }, response.parsed_body["user"])
  end

  test "login ignores email case and surrounding spaces" do
    login(email: " ANA@example.com ")

    assert_response :success
  end

  test "login with a wrong password is refused" do
    login(password: "senha-errada")

    assert_response :unauthorized
    assert_equal [ "E-mail ou senha incorretos." ], response.parsed_body["errors"]
  end

  test "login with an unknown email gets the same answer as a wrong password" do
    login(email: "ninguem@example.com")

    assert_response :unauthorized
    assert_equal [ "E-mail ou senha incorretos." ], response.parsed_body["errors"]
  end

  test "login removes expired tokens" do
    _record, old_token = AuthToken.issue_for(users(:ana))
    AuthToken.find_by!(token_digest: AuthToken.digest(old_token)).update!(expires_at: 1.minute.ago)

    assert_difference("AuthToken.count", 0) { login }
  end

  # ---------- uso do token

  test "me requires a token" do
    get api_v1_me_url, as: :json

    assert_response :unauthorized
  end

  test "me refuses an invalid token" do
    get api_v1_me_url, headers: bearer("token-que-nao-existe"), as: :json

    assert_response :unauthorized
  end

  test "me refuses a token in another scheme" do
    _record, token = AuthToken.issue_for(users(:ana))

    get api_v1_me_url, headers: { "Authorization" => "Basic #{token}" }, as: :json

    assert_response :unauthorized
  end

  test "an expired token is refused" do
    record, token = AuthToken.issue_for(users(:ana))
    record.update!(expires_at: 1.minute.ago)

    get api_v1_me_url, headers: bearer(token), as: :json

    assert_response :unauthorized
  end

  test "logout invalidates the token" do
    _record, token = AuthToken.issue_for(users(:ana))

    delete api_v1_logout_url, headers: bearer(token), as: :json
    assert_response :no_content

    get api_v1_me_url, headers: bearer(token), as: :json
    assert_response :unauthorized
  end

  test "logout only invalidates the token that was used" do
    _record, other_device = AuthToken.issue_for(users(:ana))
    _record, this_device = AuthToken.issue_for(users(:ana))

    delete api_v1_logout_url, headers: bearer(this_device), as: :json

    get api_v1_me_url, headers: bearer(other_device), as: :json
    assert_response :success
  end

  test "data endpoints refuse requests without a token" do
    %i[ api_v1_subjects_url api_v1_tasks_url api_v1_exams_url api_v1_notes_url ].each do |route|
      get public_send(route), as: :json

      assert_response :unauthorized, "#{route} should require login"
    end
  end
end
