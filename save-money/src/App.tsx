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
type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "save-money:theme";
const CURRENT_YEAR = new Date().getFullYear();
const COPYRIGHT_NOTICE = `© ${CURRENT_YEAR} Save Money. Interface, identidade visual e codigo-fonte protegidos pela legislacao autoral aplicavel.`;
const COPYRIGHT_DETAILS =
  "Reproducao, distribuicao, modificacao ou uso comercial dependem de autorizacao do titular, salvo quando permitido por lei ou por licenca especifica.";

function getInitialTheme(): ThemeMode {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light",
    );
  }

  const themeButtonLabel =
    theme === "light" ? "Ativar modo escuro" : "Ativar modo claro";

  if (isCheckingSession) {
    return (
      <main className="app-shell">
        <div className="app-toolbar">
          <button className="nav-button" type="button" onClick={toggleTheme}>
            {themeButtonLabel}
          </button>
        </div>

        <section className="card centered-card">
          <p className="page-eyebrow">Autenticacao</p>
          <h1 className="brand-title">Save Money</h1>
          <p className="helper-text">Verificando sua sessao...</p>
        </section>

        <footer className="app-footer">
          <p>{COPYRIGHT_NOTICE}</p>
          <p>{COPYRIGHT_DETAILS}</p>
        </footer>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="app-shell">
        <div className="app-toolbar">
          <button className="nav-button" type="button" onClick={toggleTheme}>
            {themeButtonLabel}
          </button>
        </div>

        <Auth onAuthSuccess={handleAuthSuccess} />

        <footer className="app-footer">
          <p>{COPYRIGHT_NOTICE}</p>
          <p>{COPYRIGHT_DETAILS}</p>
        </footer>
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

          <button className="nav-button" type="button" onClick={toggleTheme}>
            {theme === "light" ? "Modo escuro" : "Modo claro"}
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

      <footer className="app-footer">
        <p>{COPYRIGHT_NOTICE}</p>
        <p>{COPYRIGHT_DETAILS}</p>
      </footer>
    </div>
  );
}

export default App;
