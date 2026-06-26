import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";

function FormCreateTask() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Kategorien laden
  useEffect(() => {
    fetch("http://localhost:5002/api/categories")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Fehler beim Laden der Kategorien");
        }
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // Task laden, falls Bearbeitungsmodus
  useEffect(() => {
    if (!id) return;

    const loadTask = async () => {
      try {
        const response = await fetch(`http://localhost:5002/api/tasks/${id}`);

        if (!response.ok) {
          throw new Error("Task konnte nicht geladen werden");
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
      } catch (error) {
        console.error(error);
      }
    };

    loadTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const task = {
      category,
      title,
      description,
      assignedUser: responsible,
      dueDate,
      status: "open",
    };

    const url = id
      ? `http://localhost:5002/api/tasks/${id}`
      : "http://localhost:5002/api/tasks";

    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error("Task konnte nicht gespeichert werden");
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
    } catch (error) {
      console.error(error);
      alert("Fehler beim Speichern");
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

        <Button variant="primary" type="submit">
          {id ? "Task aktualisieren" : "Task erstellen"}
        </Button>
      </Form>
    </Container>
  );
}

export default FormCreateTask;
