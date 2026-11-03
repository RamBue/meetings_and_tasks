import React, { useEffect, useState } from "react";
import TasksTable from "../components/Table";
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useDataChanged } from "../hooks/useDataChanged";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [userFilter, setUserFilter] = useState("");
  const location = useLocation();

  useEffect(() => {
    loadTasks();
  }, [statusFilter, userFilter]);

  const loadTasks = async () => {
    try {
      const params = new URLSearchParams();

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      if (userFilter) {
        params.append("assignedUser", userFilter);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/tasks?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Fehler beim Laden der Tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Echtzeit-Update: lädt die Liste mit den aktuellen Filtern neu
  useDataChanged(loadTasks);

  const users = [...new Set(tasks.map((task) => task.assignedUser))];

  return (
    <Container>
      <h1>Pendenzenübersicht</h1>
      {location.state?.message && (
        <Alert
          variant="success"
          style={{ padding: "4px 12px", fontSize: "0.875rem" }}
        >
          {location.state.message}
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
      </Row>

      <TasksTable tasks={tasks} loadTasks={loadTasks} />
    </Container>
  );
};

export default TasksPage;
