import { useCallback, useEffect, useState } from "react";
import TasksTable from "../components/Table";
import { Container, Row, Col, Form, Alert, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useDataChanged } from "../hooks/useDataChanged";
import { exportTasksPdf } from "../utils/exportTasksPdf";
import { apiFetch } from "../services/apiFetch";
import { apiError, errorMessage } from "../services/apiError";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [userFilter, setUserFilter] = useState("");
  const location = useLocation();

  const [reloadKey, setReloadKey] = useState(0);

  // Löst ein erneutes Laden mit den aktuellen Filtern aus
  const loadTasks = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();

    if (statusFilter) {
      params.append("status", statusFilter);
    }

    if (userFilter) {
      params.append("assignedUser", userFilter);
    }

    apiFetch(`${API_BASE_URL}/api/tasks?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          throw await apiError(response, "Pendenzen konnten nicht geladen werden");
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTasks(data);
        setLoadError("");
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setLoadError(errorMessage(error, "Pendenzen konnten nicht geladen werden"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter, userFilter, reloadKey]);

  // Auswahl "Verantwortlich": immer alle Personen aus sämtlichen Pendenzen,
  // unabhängig von den gesetzten Filtern, damit man direkt wechseln kann
  useEffect(() => {
    let cancelled = false;

    apiFetch(`${API_BASE_URL}/api/tasks`)
      .then(async (response) => {
        if (!response.ok) {
          throw await apiError(response, "Verantwortliche konnten nicht geladen werden");
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const names = [...new Set(data.map((task) => task.assignedUser))];
        setUsers(names.sort((a, b) => a.localeCompare(b, "de")));
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Echtzeit-Update: lädt die Liste mit den aktuellen Filtern neu
  useDataChanged(loadTasks);

  const handleExportPdf = () => {
    const statusText = { open: "Offen", done: "Erledigt" }[statusFilter];
    const filterParts = [
      statusText ? `Status: ${statusText}` : "Alle Pendenzen",
      userFilter ? `Verantwortlich: ${userFilter}` : "",
    ].filter(Boolean);
    exportTasksPdf(tasks, filterParts.join(" · "));
  };

  return (
    <Container>
      <h1 className="page-title h2">Pendenzenübersicht</h1>
      {location.state?.message && (
        <Alert
          variant="success"
          style={{ padding: "4px 12px", fontSize: "0.875rem" }}
        >
          {location.state.message}
        </Alert>
      )}
      {loadError && (
        <Alert variant="danger" style={{ padding: "4px 12px", fontSize: "0.875rem" }}>
          {loadError}
        </Alert>
      )}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="">Alle Verantwortlichen</option>
            {users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {" "}
            <option value="">Alle Pendenzen</option>
            <option value="open">Offen</option>
            <option value="done">Erledigt</option>
          </Form.Select>
        </Col>

        <Col md={4} className="text-md-end">
          <Button
            variant="outline-secondary"
            onClick={handleExportPdf}
            disabled={tasks.length === 0}
          >
            Als PDF exportieren
          </Button>
        </Col>
      </Row>

      <TasksTable tasks={tasks} loadTasks={loadTasks} />
    </Container>
  );
};

export default TasksPage;
