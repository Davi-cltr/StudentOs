require "test_helper"

class AuthTokenTest < ActiveSupport::TestCase
  test "issue_for returns a token that authenticates" do
    record, token = AuthToken.issue_for(users(:ana))

    assert_equal record, AuthToken.authenticate(token)
  end

  test "the database stores only the digest, never the token" do
    record, token = AuthToken.issue_for(users(:ana))

    assert_not_equal token, record.token_digest
    assert_equal AuthToken.digest(token), record.token_digest
  end

  test "each token is different" do
    _a, first = AuthToken.issue_for(users(:ana))
    _b, second = AuthToken.issue_for(users(:ana))

    assert_not_equal first, second
  end

  test "tokens expire after the lifetime" do
    record, _token = AuthToken.issue_for(users(:ana))

    assert_in_delta AuthToken::LIFETIME.from_now.to_f, record.expires_at.to_f, 5
  end

  test "an expired token does not authenticate" do
    record, token = AuthToken.issue_for(users(:ana))
    record.update!(expires_at: 1.second.ago)

    assert_nil AuthToken.authenticate(token)
  end

  test "unknown and blank tokens do not authenticate" do
    assert_nil AuthToken.authenticate("desconhecido")
    assert_nil AuthToken.authenticate("")
    assert_nil AuthToken.authenticate(nil)
  end

  test "expired scope finds only expired tokens" do
    old, _old_token = AuthToken.issue_for(users(:ana))
    old.update!(expires_at: 1.minute.ago)
    fresh, _fresh_token = AuthToken.issue_for(users(:ana))

    assert_includes AuthToken.expired, old
    assert_not_includes AuthToken.expired, fresh
  end
end
