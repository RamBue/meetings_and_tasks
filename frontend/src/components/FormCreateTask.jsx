import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { API_BASE_URL } from "../config/api";
import { apiFetch } from "../services/apiFetch";
import { apiError, errorMessage } from "../services/apiError";

function FormCreateTask() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  // Kategorien laden
  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/categories`)
      .then(async (res) => {
        if (!res.ok) {
          throw await apiError(res, "Kategorien konnten nicht geladen werden");
        }
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error(err);
        setError(errorMessage(err, "Kategorien konnten nicht geladen werden"));
      });
  }, []);

  // Task laden, falls Bearbeitungsmodus
  useEffect(() => {
    if (!id) return;

    const loadTask = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/api/tasks/${id}`);

        if (!response.ok) {
          throw await apiError(response, "Pendenz konnte nicht geladen werden");
        }

        const task = await response.json();

        setCategory(task.category || "");
        setTitle(task.title || "");
        setDescription(task.description || "");
        setResponsible(task.assignedUser || "");
        setDueDate(
          task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
        );
      } catch (err) {
        console.error(err);
        setError(errorMessage(err, "Pendenz konnte nicht geladen werden"));
      }
    };

    loadTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const task = {
      category,
      title,
      description,
      assignedUser: responsible,
      dueDate,
      status: "open",
    };

    const url = id
      ? `${API_BASE_URL}/api/tasks/${id}`
      : `${API_BASE_URL}/api/tasks`;

    const method = id ? "PUT" : "POST";

    try {
      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw await apiError(response, "Pendenz konnte nicht gespeichert werden");
      }

      navigate("/tasks", {
        state: {
          message: id
            ? "Task erfolgreich aktualisiert"
            : "Task erfolgreich erstellt",
        },
      });

      // Nur nach Neuanlage zurücksetzen
      if (!id) {
        setCategory("");
        setTitle("");
        setDescription("");
        setResponsible("");
        setDueDate("");
      }
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Pendenz konnte nicht gespeichert werden"));
    }
  };

  return (
    <Container className="mt-4">
      <Form onSubmit={handleSubmit}>
        {/* Kategorie */}
        <Form.Group className="mb-3">
          <Form.Label>Kategorie</Form.Label>
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Bitte wählen...</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Titel */}
        <Form.Group className="mb-3">
          <Form.Label>Titel</Form.Label>
          <Form.Control
            type="text"
            placeholder="Titel eingeben"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>

        {/* Beschreibung */}
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

        {/* Verantwortlich */}
        <Form.Group className="mb-3">
          <Form.Label>Verantwortlich</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name eingeben"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          />
        </Form.Group>

        {/* Fällig am */}
        <Form.Group className="mb-3">
          <Form.Label>Fällig am</Form.Label>
          <Form.Control
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Form.Group>

        {error && (
          <div className="text-danger mb-3" role="alert">
            {error}
          </div>
        )}

        <Button variant="success" className="btn-accent" type="submit">
          {id ? "Task aktualisieren" : "Task erstellen"}
        </Button>
      </Form>
    </Container>
  );
}

export default FormCreateTask;
