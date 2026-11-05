import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router";

import logo from "../assets/logo.svg";
import ActiveButton from "./Button";

function MyNavbar() {
  return (
    <Navbar expand="lg" className="app-navbar">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2"
        >
          <img src={logo} alt="officimo" height="40" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/tasks">
              Pendenzen
            </Nav.Link>
            <Nav.Link as={Link} to="/">
              Meetings
            </Nav.Link>

            <div className="ms-3 d-flex gap-2">
              <ActiveButton text="Neue Pendenz" to="/createTask" />

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
