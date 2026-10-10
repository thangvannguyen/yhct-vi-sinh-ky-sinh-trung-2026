import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Learn from './pages/Learn.jsx'
import LessonPage from './pages/LessonPage.jsx'
import Study from './pages/Study.jsx'
import ReviewWrong from './pages/ReviewWrong.jsx'
import QuizSetup from './pages/QuizSetup.jsx'
import QuizPlay from './pages/QuizPlay.jsx'
import QuizResult from './pages/QuizResult.jsx'

// Gắn key theo bài để chuyển bài là mount lại từ đầu (vị trí đọc tiếp, mục đang
// đọc… không bị mang sang bài khác).
function LessonRoute() {
  const { lessonId } = useParams()
  return <LessonPage key={lessonId} />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/:lessonId/:sectionId?" element={<LessonRoute />} />
        <Route path="study/:chapterId/:index?" element={<Study />} />
        <Route path="review-wrong/:index?" element={<ReviewWrong />} />
        <Route path="quiz-setup" element={<QuizSetup />} />
        <Route path="quiz" element={<QuizPlay />} />
        <Route path="quiz-result" element={<QuizResult />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
