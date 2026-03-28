import { getTransactions } from "../services/transactionService";
import {
  calculateTransactionSummary,
  formatCurrency,
  formatDate,
} from "../utils/transactionUtils";

interface DashboardProps {
  onCreateTransaction: () => void;
}

function Dashboard({ onCreateTransaction }: DashboardProps) {
  const transactions = getTransactions().sort((firstTransaction, secondTransaction) =>
    secondTransaction.date.localeCompare(firstTransaction.date),
  );
  const summary = calculateTransactionSummary(transactions);

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="page-eyebrow">Visao geral</p>
          <h2 className="page-title">Controle Financeiro</h2>
          <p className="helper-text">
            Acompanhe seu saldo, entenda seus gastos e visualize as ultimas movimentacoes.
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

        {transactions.length === 0 ? (
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
                    {transaction.category} - {formatDate(transaction.date)}
                  </p>

                  {transaction.description ? (
                    <p className="transaction-description">{transaction.description}</p>
                  ) : null}
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
