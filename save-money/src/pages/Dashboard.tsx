import { useEffect, useState } from "react";
import {
  deleteTransaction,
  getTransactions,
} from "../services/transactionService";
import type { Transaction } from "../types/transaction";
import {
  calculateTransactionSummary,
  formatCurrency,
  formatDate,
} from "../utils/transactionUtils";

interface DashboardProps {
  onCreateTransaction: () => void;
}

function Dashboard({ onCreateTransaction }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      try {
        const loadedTransactions = await getTransactions();

        if (!isMounted) {
          return;
        }

        setTransactions(loadedTransactions);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar as transacoes.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = calculateTransactionSummary(transactions);

  async function handleDeleteTransaction(transactionId: string) {
    const shouldDelete = window.confirm(
      "Tem certeza que deseja excluir esta transacao?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteTransaction(transactionId);

      setTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== transactionId,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir a transacao.",
      );
    }
  }

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="page-eyebrow">Visao geral</p>
          <h2 className="page-title">Controle Financeiro</h2>
          <p className="helper-text">
            Agora a dashboard esta lendo dados reais do PostgreSQL via API.
          </p>
        </div>

        <button
          className="nav-button nav-button-primary"
          type="button"
          onClick={onCreateTransaction}
        >
          Cadastrar transacao
        </button>
      </section>

      <section className="summary-grid" aria-label="Resumo financeiro">
        <article className="summary-card">
          <span className="summary-label">Entradas</span>
          <strong className="summary-value income-text">
            {formatCurrency(summary.incomeTotal)}
          </strong>
        </article>

        <article className="summary-card">
          <span className="summary-label">Saidas</span>
          <strong className="summary-value expense-text">
            {formatCurrency(summary.expenseTotal)}
          </strong>
        </article>

        <article className="summary-card summary-card-balance">
          <span className="summary-label">Saldo atual</span>
          <strong className="summary-value">{formatCurrency(summary.balance)}</strong>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="page-eyebrow">Historico</p>
            <h2 className="section-title">Transacoes recentes</h2>
          </div>

          <span className="section-badge">
            {transactions.length} transa{transactions.length === 1 ? "cao" : "coes"}
          </span>
        </div>

        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

        {isLoading ? (
          <p className="empty-state">Carregando transacoes...</p>
        ) : transactions.length === 0 ? (
          <p className="empty-state">
            Nenhuma transacao registrada ainda. Cadastre a primeira para ver o resumo funcionando.
          </p>
        ) : (
          <ul className="transaction-list">
            {transactions.map((transaction) => (
              <li className="transaction-item" key={transaction.id}>
                <div className="transaction-content">
                  <div className="transaction-header">
                    <h3>{transaction.title}</h3>
                    <strong
                      className={`transaction-amount ${
                        transaction.type === "income" ? "income-text" : "expense-text"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </strong>
                  </div>

                  <p className="transaction-meta">
                    {transaction.category} - {transaction.accountName} - {formatDate(transaction.date)}
                  </p>

                  {transaction.description ? (
                    <p className="transaction-description">{transaction.description}</p>
                  ) : null}

                  <div className="transaction-actions">
                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
