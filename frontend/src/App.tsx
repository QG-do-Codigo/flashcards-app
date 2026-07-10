import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudyPage } from './pages/StudyPage';
import { ProfilePage } from './pages/ProfilePage';
import { DecksPage } from './pages/DecksPage';
import { CreateDeckPage } from './pages/CreateDeckPage';
import { DeckDetailPage } from './pages/DeckDetailPage';
import { CardFormPage } from './pages/CardFormPage';
import { AppLayout } from './components/shared/AppLayout';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/study/:deckId"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/decks/new" element={<CreateDeckPage />} />
          <Route path="/decks/:deckId" element={<DeckDetailPage />} />
          <Route path="/decks/:deckId/cards/new" element={<CardFormPage />} />
          <Route path="/decks/:deckId/cards/:cardId/edit" element={<CardFormPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
