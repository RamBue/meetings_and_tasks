import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MeetingDetailPage from "./pages/MeetingDetailPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import EditTaskPage from "./pages/EditTaskPage";
import TasksPage from "./pages/TasksPage";
import MyNavbar from "./components/navbar";

const App = () => {
  return (
    <div>
      <MyNavbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/meeting/:id" element={<MeetingDetailPage />} />
        <Route path="/createTask" element={<CreateTaskPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
      </Routes>
    </div>
  );
};

export default App;
