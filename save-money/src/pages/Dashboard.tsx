import { useEffect, useState } from "react";
import {
  deleteTransaction,
  getTransactions,
} from "../services/transactionService";
import type { Transaction } from "../types/transaction";
import {
  calculateMonthlyTransactionSummaries,
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
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

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
  const monthlySummaries = calculateMonthlyTransactionSummaries(transactions);
  const activeMonthKey =
    selectedMonthKey &&
    monthlySummaries.some((monthSummary) => monthSummary.monthKey === selectedMonthKey)
      ? selectedMonthKey
      : (monthlySummaries[monthlySummaries.length - 1]?.monthKey ?? null);
  const selectedMonthSummary =
    monthlySummaries.find((monthSummary) => monthSummary.monthKey === activeMonthKey) ??
    null;

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
            <p className="page-eyebrow">Painel mensal</p>
            <h2 className="section-title">Resumo mês a mês</h2>
            <p className="helper-text">
              Inspirado na sua planilha: cada mês mostra o quanto entrou, o quanto saiu e qual foi o saldo.
            </p>
          </div>
        </div>

        {monthlySummaries.length === 0 ? (
          <p className="empty-state">
            Assim que voce cadastrar transacoes, esta area vai montar um resumo mensal no estilo da sua planilha.
          </p>
        ) : (
          <div className="monthly-grid">
            {monthlySummaries.map((monthSummary) => (
              <button
                key={monthSummary.monthKey}
                className={`month-card ${
                  monthSummary.monthKey === activeMonthKey ? "is-active" : ""
                }`}
                type="button"
                onClick={() => setSelectedMonthKey(monthSummary.monthKey)}
              >
                <span className="month-card-label">{monthSummary.monthLabel}</span>
                <strong className="month-card-balance">
                  {formatCurrency(monthSummary.balance)}
                </strong>
                <span className="month-card-meta">
                  Entrou {formatCurrency(monthSummary.incomeTotal)}
                </span>
                <span className="month-card-meta">
                  Saiu {formatCurrency(monthSummary.expenseTotal)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedMonthSummary ? (
        <section className="card">
          <div className="section-heading">
            <div>
              <p className="page-eyebrow">Detalhamento mensal</p>
              <h2 className="section-title">{selectedMonthSummary.monthLabel}</h2>
              <p className="helper-text">
                Aqui fica a leitura mais parecida com a planilha: resumo do mes, renda mensal e despesas mensais.
              </p>
            </div>

            <span className="section-badge">
              {selectedMonthSummary.expensePercentage === null
                ? "Sem renda no mes"
                : `${selectedMonthSummary.expensePercentage.toFixed(1)}% da renda gasta`}
            </span>
          </div>

          <section className="summary-grid summary-grid-compact">
            <article className="summary-card">
              <span className="summary-label">Total mensal de renda</span>
              <strong className="summary-value income-text">
                {formatCurrency(selectedMonthSummary.incomeTotal)}
              </strong>
            </article>

            <article className="summary-card">
              <span className="summary-label">Total mensal de despesas</span>
              <strong className="summary-value expense-text">
                {formatCurrency(selectedMonthSummary.expenseTotal)}
              </strong>
            </article>

            <article className="summary-card summary-card-balance">
              <span className="summary-label">Saldo do mes</span>
              <strong className="summary-value">
                {formatCurrency(selectedMonthSummary.balance)}
              </strong>
            </article>
          </section>

          <div className="monthly-detail-grid">
            <article className="ledger-card">
              <div className="ledger-header">
                <div>
                  <p className="page-eyebrow">Entradas</p>
                  <h3 className="ledger-title">Renda mensal</h3>
                </div>
                <strong className="income-text">
                  {formatCurrency(selectedMonthSummary.incomeTotal)}
                </strong>
              </div>

              {selectedMonthSummary.incomes.length === 0 ? (
                <p className="empty-state compact-empty-state">
                  Nenhuma entrada registrada neste mes.
                </p>
              ) : (
                <ul className="ledger-list">
                  {selectedMonthSummary.incomes.map((transaction) => (
                    <li className="ledger-item" key={transaction.id}>
                      <div>
                        <strong>{transaction.title}</strong>
                        <p className="transaction-meta">
                          {transaction.category} - {formatDate(transaction.date)}
                        </p>
                      </div>
                      <strong className="income-text">
                        {formatCurrency(transaction.amount)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="ledger-card">
              <div className="ledger-header">
                <div>
                  <p className="page-eyebrow">Saidas</p>
                  <h3 className="ledger-title">Despesas mensais</h3>
                </div>
                <strong className="expense-text">
                  {formatCurrency(selectedMonthSummary.expenseTotal)}
                </strong>
              </div>

              {selectedMonthSummary.expenses.length === 0 ? (
                <p className="empty-state compact-empty-state">
                  Nenhuma saida registrada neste mes.
                </p>
              ) : (
                <ul className="ledger-list">
                  {selectedMonthSummary.expenses.map((transaction) => (
                    <li className="ledger-item" key={transaction.id}>
                      <div>
                        <strong>{transaction.title}</strong>
                        <p className="transaction-meta">
                          {transaction.category} - {formatDate(transaction.date)}
                        </p>
                      </div>
                      <strong className="expense-text">
                        {formatCurrency(transaction.amount)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </section>
      ) : null}

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
