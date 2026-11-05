import { Container } from "react-bootstrap";
import FormCreateMeeting from "../components/FormCreateMeeting";

function CreateMeetingPage() {
  return (
    <Container>
      <h1 className="page-title h2">Meeting erstellen</h1>
      <FormCreateMeeting />
    </Container>
  );
}

export default CreateMeetingPage;
