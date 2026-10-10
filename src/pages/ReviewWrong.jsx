import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ALL_IDS } from '../lib/data.js'
import { getProgress } from '../lib/storage.js'
import { useApp } from '../lib/store.jsx'
import { BackLink, Button, Container } from '../components/ui.jsx'
import BrowsableQuestions from '../components/BrowsableQuestions.jsx'
import DocList from '../components/DocList.jsx'
import LessonIcon from '../components/LessonIcon.jsx'

export default function ReviewWrong() {
  const { index } = useParams()
  const navigate = useNavigate()
  const { mode } = useApp()

  // Snapshot the wrong-answer set once on mount so the list doesn't reshuffle
  // underneath the user as they answer (and flip questions to "correct").
  const ids = useMemo(() => {
    const progress = getProgress()
    return ALL_IDS.filter((id) => progress[id] && progress[id].lastResult === 'wrong')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ids.length) {
    return (
      <Container>
        <BackLink to="/" />
        <div className="py-10 text-center text-text-muted">
          <div className="mb-2.5 text-[2.4rem]">
            <LessonIcon icon="svg:chuc-mung" />
          </div>
          <p className="mb-5">
            Chưa có câu nào bạn trả lời sai.
            <br />
            Hãy học hoặc làm bài kiểm tra thử trước đã!
          </p>
          <Button variant="primary" to="/quiz-setup">
            Làm bài kiểm tra thử
          </Button>
        </div>
      </Container>
    )
  }

  const pageTitle = `Ôn tập câu sai (${ids.length} câu)`

  if (mode === 'full') {
    return <DocList ids={ids} backTo="/" pageTitle={pageTitle} showChapterLabels />
  }

  return (
    <BrowsableQuestions
      ids={ids}
      index={parseInt(index, 10) || 0}
      title={pageTitle}
      backTo="/"
      onIndexChange={(i) => (i === 'done' ? navigate('/') : navigate(`/review-wrong/${i}`))}
    />
  )
}
