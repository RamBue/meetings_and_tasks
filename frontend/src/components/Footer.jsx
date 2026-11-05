import Container from "react-bootstrap/Container";
import { FaQuestionCircle } from "react-icons/fa";
import { MANUAL_URL, SUPPORT_EMAIL } from "../config/links";

// Farben aus dem officimo-Logo: Dunkelblau und Grün
const LOGO_DARK = "#101525";
const LOGO_GREEN = "#a7c947";

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
          className="fs-5 lh-1"
          style={{ color: LOGO_GREEN }}
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
