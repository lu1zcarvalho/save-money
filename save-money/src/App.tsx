import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NewTransaction from "./pages/NewTransaction";
import {
  fetchCurrentUser,
  hasStoredSession,
  logoutUser,
} from "./services/authService";
import type { AuthResponse, User } from "./types/auth";

type AppPage = "dashboard" | "new-transaction";

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (!hasStoredSession()) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
      } catch {
        logoutUser();
        setCurrentUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    }

    void loadSession();
  }, []);

  function goToDashboard() {
    setCurrentPage("dashboard");
  }

  function goToNewTransaction() {
    setCurrentPage("new-transaction");
  }

  function handleTransactionCreated() {
    goToDashboard();
  }

  function handleAuthSuccess(response: AuthResponse) {
    setCurrentUser(response.user);
    setCurrentPage("dashboard");
  }

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setCurrentPage("dashboard");
  }

  if (isCheckingSession) {
    return (
      <main className="app-shell">
        <section className="card centered-card">
          <p className="page-eyebrow">Autenticacao</p>
          <h1 className="brand-title">Save Money</h1>
          <p className="helper-text">Verificando sua sessao...</p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="app-shell">
        <Auth onAuthSuccess={handleAuthSuccess} />
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="page-eyebrow">Sistema financeiro pessoal</p>
          <h1 className="brand-title">Save Money</h1>
          <p className="helper-text">Bem-vindo, {currentUser.fullName}.</p>
        </div>

        <nav className="nav-actions" aria-label="Navegacao principal">
          <button
            className={`nav-button ${currentPage === "dashboard" ? "is-active" : ""}`}
            type="button"
            onClick={goToDashboard}
          >
            Dashboard
          </button>

          <button
            className={`nav-button nav-button-primary ${currentPage === "new-transaction" ? "is-active" : ""}`}
            type="button"
            onClick={goToNewTransaction}
          >
            Nova transacao
          </button>

          <button className="nav-button" type="button" onClick={handleLogout}>
            Sair
          </button>
        </nav>
      </header>

      {currentPage === "dashboard" ? (
        <Dashboard onCreateTransaction={goToNewTransaction} />
      ) : (
        <NewTransaction
          onCancel={goToDashboard}
          onSave={handleTransactionCreated}
        />
      )}
    </div>
  );
}

export default App;
