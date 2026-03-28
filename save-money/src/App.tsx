import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import NewTransaction from "./pages/NewTransaction";

type AppPage = "dashboard" | "new-transaction";

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  function goToDashboard() {
    setCurrentPage("dashboard");
  }

  function goToNewTransaction() {
    setCurrentPage("new-transaction");
  }

  function handleTransactionCreated() {
    setDashboardRefreshKey((currentValue) => currentValue + 1);
    goToDashboard();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="page-eyebrow">Sistema financeiro pessoal</p>
          <h1 className="brand-title">Save Money</h1>
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
        </nav>
      </header>

      {currentPage === "dashboard" ? (
        <Dashboard
          refreshKey={dashboardRefreshKey}
          onCreateTransaction={goToNewTransaction}
        />
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
