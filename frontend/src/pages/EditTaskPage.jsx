import { Container } from "react-bootstrap";
import FormCreateTask from "../components/FormCreateTask";

function EditTaskPage() {
  return (
    <Container>
      <h1 className="page-title h2">Pendenz bearbeiten</h1>
      <FormCreateTask />
    </Container>
  );
}

export default EditTaskPage;