import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router";

import logo from "../assets/logo.png";
import ActiveButton from "./Button";
import { getMeetings } from "../services/meetingService";

function MyNavbar() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const data = await getMeetings();
        setMeetings(data);
      } catch (error) {
        console.error("Fehler beim Laden der Meetings:", error);
      }
    };

    loadMeetings();
  }, []);

  return (
    <Navbar expand="lg" bg="light">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2"
        >
          <img src={logo} alt="Sitzungs-Cockpit" height="40" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/tasks">
              Aufgaben
            </Nav.Link>
            <Nav.Link as={Link} to="/">
              Meetings
            </Nav.Link>

            <div className="ms-3 d-flex gap-2">
              <ActiveButton text="Neue Aufgabe" to="/createTask" />

              <ActiveButton
                text="Neues Meeting"
                to="/createMeeting"
                disabled={true}
              />
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
