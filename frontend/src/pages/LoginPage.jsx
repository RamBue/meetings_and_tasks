import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { useAuth } from "../auth/useAuth";

const ERROR_MESSAGES = {
  invalid: "Benutzername oder Passwort stimmt nicht.",
  "rate-limit": "Zu viele Versuche. Bitte warten Sie einige Minuten.",
  "not-configured": "Die Anmeldung ist noch nicht eingerichtet.",
  failed: "Der Server ist nicht erreichbar. Bitte versuchen Sie es später erneut.",
};

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Zurück zur Seite, die ursprünglich aufgerufen wurde
  const from = location.state?.from;
  const target = from ? `${from.pathname}${from.search}` : "/";

  if (isAuthenticated) {
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || ERROR_MESSAGES.failed);
      setPassword("");
      setSubmitting(false);
    }
  };

  return (
    <Container style={{ maxWidth: "420px" }}>
      <h1 className="page-title h2">Anmelden</h1>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Benutzername</Form.Label>
              <Form.Control
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Passwort</Form.Label>
              <Form.Control
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {error && (
              <div className="text-danger mb-3" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="dark"
              className="w-100"
              disabled={submitting}
            >
              Anmelden
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
