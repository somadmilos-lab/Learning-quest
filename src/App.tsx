import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RpgLayout } from './components/layout/RpgLayout';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Course } from './pages/Course';
import { Quiz } from './pages/Quiz';
import { CollabRoom } from './pages/CollabRoom';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RpgLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="course/:id" element={<Course />} />
          <Route path="course/:id/quiz" element={<Quiz />} />
          <Route path="collab/:id" element={<CollabRoom />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
