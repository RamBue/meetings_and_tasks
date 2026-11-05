import Container from "react-bootstrap/Container";
import { FaQuestionCircle } from "react-icons/fa";
import { MANUAL_URL, SUPPORT_EMAIL } from "../config/links";

// Dunkelblau aus dem officimo-Logo. Grün bleibt den Pendenzen vorbehalten,
// die Hilfe ist neutral und erscheint deshalb grau.
const LOGO_DARK = "#101525";

function Footer() {
  return (
    <footer className="mt-auto sticky-bottom" style={{ backgroundColor: LOGO_DARK }}>
      <Container className="d-flex justify-content-between align-items-center py-2 small">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-decoration-none"
          style={{ color: "#e9ecef" }}
        >
          {SUPPORT_EMAIL}
        </a>

        <a
          href={MANUAL_URL}
          target="_blank"
          rel="noreferrer"
          className="footer-help fs-5 lh-1"
          title="Anleitung öffnen"
          aria-label="Anleitung öffnen"
        >
          <FaQuestionCircle />
        </a>
      </Container>
    </footer>
  );
}

export default Footer;
