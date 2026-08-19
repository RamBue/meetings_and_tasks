import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { Link } from "react-router";
import Badge from "react-bootstrap/Badge";
import { CATEGORIES } from "../config/categories";

function MeetingOverview({ meetings }) {
  const categoryColors = Object.fromEntries(
    CATEGORIES.map((c) => [c.value, c.color]),
  );

  if (!meetings || meetings.length === 0) {
    return (
      <div className="text-center mt-4">
        <p>Keine Meetings vorhanden.</p>
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {meetings.map((meeting) => (
        <Col key={meeting._id}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <Badge bg={categoryColors[meeting.category] || "secondary"}>
                {meeting.category}
              </Badge>
              <hr />
              <Card.Text>
                <strong>Beginn:</strong>
                <br />
                {new Date(meeting.startsAt).toLocaleString("de-CH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Card.Text>

              <Card.Text>
                <strong>Ende:</strong>
                <br />
                {new Date(meeting.endsAt).toLocaleString("de-CH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Card.Text>
              <hr />

              <Card.Title>{meeting.title}</Card.Title>

              <Card.Text className="text-muted">
                {meeting.location || "Kein Ort angegeben"}
              </Card.Text>

              <div className="mt-auto">
                <Button
                  as={Link}
                  to={`/meeting/${meeting._id}`}
                  variant="outline-secondary"
                  className="w-100"
                >
                  Details anzeigen
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default MeetingOverview;
