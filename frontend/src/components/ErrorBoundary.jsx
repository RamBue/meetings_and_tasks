import { Component } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

// Fängt unerwartete Fehler beim Darstellen der Seite ab. Ohne diesen Baustein
// bliebe der Bildschirm weiss, und die Anwendung wäre nicht mehr bedienbar.
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unerwarteter Fehler in der Anwendung", error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Container className="page-top" style={{ maxWidth: "560px" }}>
        <h1 className="h3">Etwas ist schiefgelaufen</h1>
        <p>
          Die Seite konnte nicht angezeigt werden. Ihre Daten sind nicht
          betroffen. Bitte laden Sie die Seite neu. Falls der Fehler bleibt,
          melden Sie sich beim Support.
        </p>
        <div className="d-flex gap-2">
          <Button variant="dark" onClick={() => window.location.reload()}>
            Seite neu laden
          </Button>
          <Button
            variant="light"
            className="btn-soft"
            onClick={() => window.location.assign("/")}
          >
            Zur Startseite
          </Button>
        </div>
      </Container>
    );
  }
}

export default ErrorBoundary;
