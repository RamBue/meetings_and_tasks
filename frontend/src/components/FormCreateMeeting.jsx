import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { API_BASE_URL } from "../config/api";
import { getUsers } from "../services/userService";
import { createMeeting } from "../services/meetingService";
import MultiUserSelect from "./MultiUserSelect";
import { apiFetch } from "../services/apiFetch";
import { errorMessage } from "../services/apiError";

function FormCreateMeeting() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [chair, setChair] = useState("");
  const [businessUnitLeads, setBusinessUnitLeads] = useState([]);
  const [excusedUsers, setExcusedUsers] = useState([]);
  const [guests, setGuests] = useState("");
  const [minutesBy, setMinutesBy] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Kategorien laden
  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Fehler beim Laden der Kategorien");
        }
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // Benutzer für Leitung, Bereichsleitung, Entschuldigt und Protokoll laden
  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("Fehler beim Laden der Benutzer:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("Das Ende muss nach dem Beginn liegen");
      return;
    }

    const meeting = {
      category,
      title,
      description,
      location,
      // datetime-local liefert keine Zeitzone, daher hier in ISO (UTC) umwandeln
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      chair: chair || null,
      businessUnitLeads,
      excusedUsers,
      guests,
      minutesBy: minutesBy || null,
    };

    setSaving(true);

    try {
      const savedMeeting = await createMeeting(meeting);
      navigate(`/meeting/${savedMeeting._id}`);
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Meeting konnte nicht gespeichert werden"));
      setSaving(false);
    }
  };

  return (
    <Container className="mt-4">
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Titel */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Titel</Form.Label>
              <Form.Control
                type="text"
                placeholder="Titel eingeben"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                minLength={3}
                required
              />
            </Form.Group>
          </Col>

          {/* Kategorie */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Kategorie</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Bitte wählen...</option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Beginn */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Beginn</Form.Label>
              <Form.Control
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          {/* Ende */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Ende</Form.Label>
              <Form.Control
                type="datetime-local"
                value={endsAt}
                min={startsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          {/* Ort */}
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Ort</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ort eingeben"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Beschreibung */}
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Beschreibung</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Beschreibung eingeben"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Leitung */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Leitung</Form.Label>
              <Form.Select
                value={chair}
                onChange={(e) => setChair(e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Protokoll */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Protokoll</Form.Label>
              <Form.Select
                value={minutesBy}
                onChange={(e) => setMinutesBy(e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Bereichsleitung */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Bereichsleitung</Form.Label>
              <MultiUserSelect
                idPrefix="new-bl"
                users={users}
                selectedIds={businessUnitLeads}
                onChange={setBusinessUnitLeads}
              />
            </Form.Group>
          </Col>

          {/* Entschuldigt */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Entschuldigt</Form.Label>
              <MultiUserSelect
                idPrefix="new-ex"
                users={users}
                selectedIds={excusedUsers}
                onChange={setExcusedUsers}
              />
            </Form.Group>
          </Col>

          {/* Gäste */}
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Gäste</Form.Label>
              <Form.Control
                type="text"
                placeholder="Namen der Gäste"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {error && <div className="text-danger mb-3">{error}</div>}

        <Button variant="primary" type="submit" disabled={saving}>
          Meeting erstellen
        </Button>
      </Form>
    </Container>
  );
}

export default FormCreateMeeting;
