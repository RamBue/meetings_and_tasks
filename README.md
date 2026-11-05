# Sitzungs-Cockpit

Webanwendung zum Verwalten von Meetings und Pendenzen. Entstanden als Abschlussarbeit zum Webengineer NDK HF (IBAW).

Heute werden Einladungen, Traktandenlisten, Protokolle und Pendenzenlisten in Word-Dokumenten geführt. Das Sitzungs-Cockpit ersetzt das durch eine zentrale Anwendung. Der Schwerpunkt liegt auf der Verwaltung der Pendenzen: planen, überwachen und verschieben mit wenig Aufwand.

## Funktionsumfang

**Etappe 1 (Pflichtumfang)**

- Meeting-Übersicht mit farblicher Kategorisierung
- Meeting-Detailseite mit Besetzung, Protokoll, Pendenzen und Traktanden
- Pendenzen als Bausteine: hinzufügen, terminieren, bearbeiten, als erledigt markieren
- Pendenzenübersicht mit Filter (Status, Verantwortliche) und PDF-Export
- Echtzeit-Update aller Seiten ohne manuellen Reload (Socket.io)

**Zusätzlich aus Etappe 2**

- Traktanden mit Entscheiden, Informationen und Pendenzen, inklusive Löschen und Verschieben in ein anderes Meeting (nur solange das Traktandum leer ist)
- Besetzung mit Dropdown und Mehrfachauswahl
- Protokoll-PDF hochladen, Genehmigung und Korrekturen erfassen
- PDF-Export der Meeting-Detailseite als Einladung oder Protokoll

**Nicht umgesetzt**

- Meeting anlegen (der Button in der Navbar ist deaktiviert)
- Slider in der Meeting-Übersicht
- Drag & Drop für Pendenzen
- Login und Zugriffsverwaltung, Suchfunktion (laut Projektantrag nicht Teil der Arbeit)

## Technik

| Bereich | Technik |
|---|---|
| Frontend | React 19, Vite, React Router, React Bootstrap |
| Backend | Node.js, Express 4 (ES-Module), Mongoose |
| Datenbank | MongoDB |
| Echtzeit | Socket.io |
| PDF-Export | jsPDF, jsPDF-AutoTable (im Browser) |
| Datei-Upload | Multer |
| Betrieb | Docker Compose lokal, Render in der Cloud |

## Projektstruktur

```
.
├── backend/            Express-API
│   └── src/
│       ├── config/        Datenbank, Kategorien, Socket.io
│       ├── controllers/   Logik pro Ressource
│       ├── middleware/    Datei-Upload, Prüfung der IDs
│       ├── models/        Mongoose-Modelle
│       ├── routes/        REST-Routen
│       └── server.js
├── frontend/           React-App
│   └── src/
│       ├── components/    Bausteine (Pendenz, Traktandum, Entscheid, ...)
│       ├── config/        API-Adresse, Kategorien mit Farben
│       ├── hooks/         useDataChanged (Socket.io)
│       ├── pages/         Übersicht, Detailseite, Pendenzen
│       ├── services/      Aufrufe der REST-API
│       └── utils/         PDF-Export
├── docs/               Datenmodell (Hackolade)
├── compose.yaml        Docker Compose (Backend, Frontend, MongoDB)
├── render.yaml         Deployment auf Render
└── .env.example        Vorlage für die Umgebungsvariablen
```

## Lokal starten

### Mit Docker (empfohlen)

Voraussetzung: Docker Desktop.

```bash
cp .env.example .env
docker compose up -d --build
```

Danach läuft:

- Frontend: <http://localhost:8080>
- Backend (API): <http://localhost:5002>
- MongoDB: nur im Docker-Netzwerk erreichbar, die Daten liegen im Volume `mongo-data`

Nach jeder Codeänderung muss neu gebaut werden, denn Docker kopiert den Code beim Build in das Image:

```bash
docker compose up -d --build backend frontend
```

Achtung: `docker compose down -v` löscht auch das Volume und damit alle Daten.

### Ohne Docker (Entwicklung mit Live-Reload)

Voraussetzung: Node.js 24 und eine erreichbare MongoDB.

```bash
# Backend (Port 5002)
cd backend
npm install
npm run dev

# Frontend (Port 5173), in einem zweiten Terminal
cd frontend
npm install
npm run dev
```

In der `.env` zeigt `MONGODB_URI` auf den Docker-Host `mongo`. Ohne Docker ersetzt du ihn durch deine eigene Adresse, zum Beispiel `mongodb://localhost:27017/meetings_and_tasks_db`.

## Umgebungsvariablen

| Variable | Wo | Bedeutung |
|---|---|---|
| `PORT` | Backend | Port der API, Standard `5002` |
| `MONGODB_URI` | Backend | Verbindung zur MongoDB |
| `CORS_ORIGIN` | Backend | Erlaubte Adressen des Frontends, durch Komma getrennt. Gilt auch für Socket.io |
| `VITE_API_URL` | Frontend (beim Build) | Adresse des Backends, Standard `http://localhost:5002` |

`VITE_API_URL` wird beim Build in die App eingebaut. Ändert sie sich, muss das Frontend neu gebaut werden.

## REST-API

Alle Routen liegen unter `/api`. Die Ressourcen Pendenzen, Meetings, Traktanden, Entscheide und Informationen bieten die üblichen Aufrufe `GET /`, `GET /:id`, `POST /`, `PUT /:id` und `DELETE /:id`.

| Pfad | Ressource | Hinweise |
|---|---|---|
| `/api/tasks` | Pendenzen | Filter: `status`, `meetingId`, `agendaItemId`, `assignedUser` |
| `/api/meetings` | Meetings | `GET /:id` liefert Meeting, fällige Pendenzen und Traktanden |
| `/api/meetings/:id/protocol` | Protokoll-PDF | `POST` lädt hoch (max. 20 MB, nur PDF) |
| `/api/meetings/:id/protocol/download` | Protokoll-PDF | `GET` lädt herunter |
| `/api/agenda-items` | Traktanden | Filter: `meetingId` |
| `/api/decisions` | Entscheide | Filter: `meetingId`, `agendaItemId`. Die Nummer wird pro Meeting automatisch vergeben |
| `/api/informations` | Informationen | Filter: `meetingId`, `agendaItemId` |
| `/api/users` | Benutzer | `GET` und `POST` |
| `/api/categories` | Meeting-Kategorien | `GET` |

## Datenmodell

```
Meeting ──< AgendaItem (Traktandum) ──< Decision (Entscheid)
   │                  │             ──< Information
   │                  └────────────── < Task (Pendenz)
   └── chair, businessUnitLeads, excusedUsers, minutesBy ──> User
```

- Ein Meeting hat Titel, Kategorie, Ort, Beginn und Ende, Besetzung (Leitung, Bereichsleitung, Entschuldigte, Gäste, Protokoll) und die Angaben zum Protokoll (hochgeladene PDF, Genehmigung, Korrekturen).
- Ein Traktandum gehört zu einem Meeting und hat Verantwortliche sowie geplante und effektive Zeiten.
- Entscheide, Informationen und Pendenzen können einem Traktandum zugeordnet sein.
- **Zuordnung der Pendenzen:** Auf der Meeting-Detailseite erscheinen Pendenzen ohne Traktandum anhand ihres Fälligkeitsdatums. Fällt es auf den Tag des Meetings, erscheint die Pendenz dort. Wer das Datum ändert, verschiebt die Pendenz damit automatisch in das passende Meeting.
- **Traktandum verschieben:** Im Bearbeiten-Formular eines Traktandums steht das Meeting-Datum. Ein anderes Datum verschiebt das Traktandum in das Meeting, das an diesem Tag stattfindet. Gibt es an dem Tag kein Meeting, erscheint eine Meldung. Bei mehreren Meetings am selben Tag gilt dasjenige mit derselben Kategorie, sonst bleibt die Zuordnung offen.
- **Traktandum löschen:** Mit dem Knopf «Löschen» beim Traktandum, nach einer Rückfrage.
- **Sperre:** Verschieben und Löschen sind nur möglich, solange das Traktandum keinen Entscheid, keine Information und keine Pendenz enthält, denn dann hat das Meeting noch nicht stattgefunden. Das Backend erzwingt das (`409 Conflict`), das Frontend deaktiviert den Knopf und das Datumsfeld und erklärt den Grund.
- Ein Hackolade-Export des Datenmodells liegt in [docs](docs/). Er enthält Meeting, Task und User, aber noch nicht Traktandum, Entscheid und Information.

Die Kategorien mit ihren Farben stehen in `backend/src/config/categories.js` und `frontend/src/config/categories.js`.

## Echtzeit mit Socket.io

Das Backend sendet nach jedem Anlegen, Ändern oder Löschen von Pendenzen, Traktanden, Entscheiden, Informationen und Meetings das Event `data:changed` an alle verbundenen Clients:

```json
{ "entity": "task", "action": "updated", "id": "<id>" }
```

Die Seiten (Übersicht, Detailseite, Pendenzenliste) hören darauf mit dem Hook `useDataChanged` und laden ihre Daten im Hintergrund neu. Offene Eingaben gehen dabei nicht verloren.

Das Event geht bewusst an alle und nicht nur an ein Meeting, weil sich eine verschobene Pendenz auf zwei Meetings auswirkt.

## PDF-Export

Die PDFs entstehen im Browser, das Backend ist daran nicht beteiligt.

- **Pendenzenliste** (Pendenzenübersicht): Tabelle im A4-Querformat mit den aktuell gefilterten Pendenzen.
- **Einladung und Protokoll** (Meeting-Detailseite): A4 hoch, im Aufbau der Seite mit Karten, Badges und Checkboxen. Die Einladung zeigt den geplanten Ablauf, das Protokoll zusätzlich Entscheide, Informationen, Pendenzen, effektive Zeiten und die Genehmigung.

## Deployment auf Render

Das Deployment ist in `render.yaml` beschrieben. Es besteht aus zwei Diensten:

- **Backend:** Docker-Dienst (Frankfurt, Free-Plan). Umgebungsvariablen `MONGODB_URI` und `CORS_ORIGIN`.
- **Frontend:** statische Seite. Build mit `npm ci && npm run build`, Umgebungsvariable `VITE_API_URL`. Alle Pfade werden auf `index.html` umgeleitet.

Render baut nach einem Push auf `main` automatisch neu, sofern `autoDeploy` im Dashboard aktiv ist.

Zu beachten:

- Auf dem Free-Plan schläft das Backend nach einer Weile ein. Die erste Anfrage danach dauert etwa eine halbe Minute.
- Hochgeladene Protokoll-PDFs liegen im Dateisystem des Backends. Auf Render ist dieses nicht dauerhaft, die Dateien gehen bei einem neuen Deploy verloren. Für den dauerhaften Betrieb braucht es einen persistenten Datenträger oder einen Objektspeicher.
- Wenn die `package.json` im Frontend oder Backend geändert wird, muss die `package-lock.json` dazu passen, sonst scheitert `npm ci` im Build. Am sichersten erzeugt man sie mit derselben npm-Version wie im Build (Node 24).

## Entwicklung

```bash
cd frontend
npm run lint     # ESLint
npm run build    # Produktions-Build
```

Automatisierte Tests gibt es nicht. Die Abläufe aus Etappe 1 werden manuell geprüft.
