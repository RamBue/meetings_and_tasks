import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.svg";
import ActiveButton from "./Button";
import { useAuth } from "../auth/useAuth";

function MyNavbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

        {isAuthenticated && (
          <>
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
                    variant="primary"
                  />
                </div>

                <Button
                  variant="light"
                  className="btn-soft ms-3"
                  onClick={handleLogout}
                >
                  Abmelden
                </Button>
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
