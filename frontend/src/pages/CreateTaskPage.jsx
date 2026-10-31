import { Container } from "react-bootstrap";
import FormCreateTask from "../components/FormCreateTask";

function CreateTaskPage() {
  return (
    <Container>
    <div>
      <h1>Pendenz erstellen</h1>
      <FormCreateTask />
    </div>
    </Container>
  );
}

export default CreateTaskPage;
