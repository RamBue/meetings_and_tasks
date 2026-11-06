import { useState } from "react";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { apiFetch } from "../services/apiFetch";
import { apiError, errorMessage } from "../services/apiError";

function TasksTable({ tasks, loadTasks }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const handleEdit = (task) => {
    navigate(`/tasks/${task._id}/edit`);
  };
  const toggleTaskStatus = async (task) => {
    setError("");

    try {
      const newStatus = task.status === "done" ? "open" : "done";

      const response = await apiFetch(
        `${API_BASE_URL}/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      if (!response.ok) {
        throw await apiError(response, "Status konnte nicht aktualisiert werden");
      }

      loadTasks();
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Status konnte nicht aktualisiert werden"));
    }
  };
  return (
    <Container className="mt-4">
      {error && (
        <div className="text-danger mb-2" role="alert">
          {error}
        </div>
      )}
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Erstellt am</th>
            <th>Kategorie</th>
            <th>Titel</th>
            <th>Beschreibung</th>
            <th>Verantwortlich</th>
            <th>Fällig am</th>
            <th className="text-center">Bearbeiten</th>
            <th>Erledigt</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr
              key={task._id}
              className={
                task.status === "done" ? "text-decoration-line-through" : ""
              }
            >
              <td>{index + 1}</td>

              <td>{new Date(task.createdAt).toLocaleDateString("de-CH")}</td>

              <td>{task.category}</td>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.assignedUser}</td>
              <td>{new Date(task.dueDate).toLocaleDateString("de-CH")}</td>
              <td className="text-center align-middle">
                <FaEdit
                  className="d-block mx-auto"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEdit(task)}
                />
              </td>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={() => toggleTaskStatus(task)}
                  className="check-accent"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default TasksTable;
