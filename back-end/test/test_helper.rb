ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end

class ActionDispatch::IntegrationTest
  # Cabeçalho de login para o usuário informado: get url, headers: auth_headers(users(:ana))
  def auth_headers(user)
    _record, token = AuthToken.issue_for(user)
    { "Authorization" => "Bearer #{token}" }
  end
end
