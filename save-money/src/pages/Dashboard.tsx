import { useEffect, useState, type FormEvent } from "react";
import { getBudgets, saveBudget } from "../services/budgetService";
import { getCategories } from "../services/categoryService";
import {
  deleteAllTransactions,
  deleteTransaction,
  getTransactions,
} from "../services/transactionService";
import type { CategoryBudget } from "../types/budget";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";
import {
  calculateCategoryTransactionSummaries,
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
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [budgetErrorMessage, setBudgetErrorMessage] = useState("");
  const [budgetSuccessMessage, setBudgetSuccessMessage] = useState("");
  const [transactionSuccessMessage, setTransactionSuccessMessage] = useState("");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [loadedTransactions, loadedExpenseCategories] = await Promise.all([
          getTransactions(),
          getCategories("expense"),
        ]);

        if (!isMounted) {
          return;
        }

        setTransactions(loadedTransactions);
        setExpenseCategories(loadedExpenseCategories);
        setBudgetCategoryId(loadedExpenseCategories[0]?.id ?? "");
        setErrorMessage("");
        setTransactionSuccessMessage("");
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

    void loadDashboardData();

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
  const expenseCategorySummaries = selectedMonthSummary
    ? calculateCategoryTransactionSummaries(selectedMonthSummary.expenses, "expense")
    : [];
  const incomeCategorySummaries = selectedMonthSummary
    ? calculateCategoryTransactionSummaries(selectedMonthSummary.incomes, "income")
    : [];
  const budgetStatusItems = expenseCategories
    .map((category) => {
      const categoryExpense = expenseCategorySummaries.find(
        (summary) => summary.category === category.name,
      );
      const categoryBudget = budgets.find(
        (budget) => budget.categoryId === category.id,
      );

      if (!categoryExpense && !categoryBudget) {
        return null;
      }

      const spent = categoryExpense?.total ?? 0;
      const budgetAmountValue = categoryBudget?.amount ?? null;
      const remaining =
        budgetAmountValue === null ? null : budgetAmountValue - spent;

      return {
        categoryId: category.id,
        category: category.name,
        spent,
        budgetAmount: budgetAmountValue,
        remaining,
        percentageUsed:
          budgetAmountValue && budgetAmountValue > 0
            ? (spent / budgetAmountValue) * 100
            : null,
      };
    })
    .filter((item) => item !== null)
    .sort((firstItem, secondItem) => secondItem.spent - firstItem.spent);
  const totalBudgeted = budgets.reduce(
    (sum, budget) => sum + budget.amount,
    0,
  );
  const totalBudgetDifference =
    totalBudgeted > 0
      ? totalBudgeted - (selectedMonthSummary?.expenseTotal ?? 0)
      : null;

  useEffect(() => {
    let isMounted = true;

    async function loadBudgets() {
      if (!activeMonthKey) {
        setBudgets([]);
        setBudgetErrorMessage("");
        return;
      }

      try {
        setIsLoadingBudgets(true);
        const loadedBudgets = await getBudgets(activeMonthKey);

        if (!isMounted) {
          return;
        }

        setBudgets(loadedBudgets);
        setBudgetErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setBudgetErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os orcamentos do mes.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingBudgets(false);
        }
      }
    }

    void loadBudgets();

    return () => {
      isMounted = false;
    };
  }, [activeMonthKey]);

  useEffect(() => {
    if (!expenseCategories.length) {
      setBudgetCategoryId("");
      setBudgetAmount("");
      return;
    }

    const nextCategoryId =
      expenseCategories.some((category) => category.id === budgetCategoryId)
        ? budgetCategoryId
        : expenseCategories[0].id;
    const currentBudget = budgets.find(
      (budget) => budget.categoryId === nextCategoryId,
    );

    setBudgetCategoryId(nextCategoryId);
    setBudgetAmount(currentBudget ? String(currentBudget.amount) : "");
  }, [budgetCategoryId, budgets, expenseCategories]);

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
      setTransactionSuccessMessage("Transacao excluida com sucesso.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir a transacao.",
      );
      setTransactionSuccessMessage("");
    }
  }

  async function handleDeleteAllTransactions() {
    const shouldDelete = window.confirm(
      "Esta acao vai excluir todas as suas transacoes. Deseja continuar?",
    );

    if (!shouldDelete) {
      return;
    }

    const confirmationText = window.prompt(
      "Para confirmar, digite APAGAR no campo abaixo.",
      "",
    );

    if (confirmationText !== "APAGAR") {
      setErrorMessage("Exclusao cancelada. O texto de confirmacao nao foi informado corretamente.");
      setTransactionSuccessMessage("");
      return;
    }

    try {
      const deletedCount = await deleteAllTransactions();

      setTransactions([]);
      setSelectedMonthKey(null);
      setErrorMessage("");
      setTransactionSuccessMessage(
        deletedCount > 0
          ? `${deletedCount} transacoes foram excluidas com sucesso.`
          : "Nao havia transacoes para excluir.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir todas as transacoes.",
      );
      setTransactionSuccessMessage("");
    }
  }

  function handleBudgetCategoryChange(nextCategoryId: string) {
    setBudgetCategoryId(nextCategoryId);

    const currentBudget = budgets.find(
      (budget) => budget.categoryId === nextCategoryId,
    );

    setBudgetAmount(currentBudget ? String(currentBudget.amount) : "");
    setBudgetSuccessMessage("");
    setBudgetErrorMessage("");
  }

  async function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeMonthKey) {
      setBudgetErrorMessage("Selecione um mes antes de salvar o orcamento.");
      return;
    }

    if (!budgetCategoryId) {
      setBudgetErrorMessage("Escolha uma categoria para o orcamento.");
      return;
    }

    const parsedAmount = Number(budgetAmount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setBudgetErrorMessage("Informe um valor de orcamento maior que zero.");
      return;
    }

    try {
      setIsSavingBudget(true);
      const savedBudget = await saveBudget({
        categoryId: budgetCategoryId,
        month: activeMonthKey,
        amount: parsedAmount,
      });

      setBudgets((currentBudgets) => {
        const existingBudgetIndex = currentBudgets.findIndex(
          (budget) => budget.categoryId === savedBudget.categoryId,
        );

        if (existingBudgetIndex === -1) {
          return [...currentBudgets, savedBudget].sort((firstBudget, secondBudget) =>
            firstBudget.category.localeCompare(secondBudget.category),
          );
        }

        const nextBudgets = [...currentBudgets];
        nextBudgets[existingBudgetIndex] = savedBudget;

        return nextBudgets;
      });

      setBudgetAmount(String(savedBudget.amount));
      setBudgetSuccessMessage("Orcamento salvo com sucesso para este mes.");
      setBudgetErrorMessage("");
    } catch (error) {
      setBudgetErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar o orcamento.",
      );
      setBudgetSuccessMessage("");
    } finally {
      setIsSavingBudget(false);
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

          <div className="budget-grid">
            <article className="ledger-card">
              <div className="ledger-header">
                <div>
                  <p className="page-eyebrow">Orcamento</p>
                  <h3 className="ledger-title">Orcamento por categoria</h3>
                </div>
                <div className="budget-totals">
                  <strong className="income-text">
                    {formatCurrency(totalBudgeted)}
                  </strong>
                  <span className="transaction-meta">orcado no mes</span>
                </div>
              </div>

              {totalBudgetDifference !== null ? (
                <p className="budget-overview">
                  {totalBudgetDifference >= 0
                    ? `Voce ainda tem ${formatCurrency(totalBudgetDifference)} dentro do orcamento.`
                    : `Voce ultrapassou o orcamento do mes em ${formatCurrency(Math.abs(totalBudgetDifference))}.`}
                </p>
              ) : (
                <p className="budget-overview">
                  Defina orcamentos mensais para comparar suas saidas com o planejado.
                </p>
              )}

              {budgetErrorMessage ? (
                <p className="error-message">{budgetErrorMessage}</p>
              ) : null}

              {isLoadingBudgets ? (
                <p className="empty-state compact-empty-state">
                  Carregando orcamentos do mes...
                </p>
              ) : budgetStatusItems.length === 0 ? (
                <p className="empty-state compact-empty-state">
                  Nenhum orcamento ou despesa cadastrada para este mes.
                </p>
              ) : (
                <ul className="budget-status-list">
                  {budgetStatusItems.map((budgetItem) => (
                    <li
                      className="budget-status-item"
                      key={`budget-status-${budgetItem.categoryId}`}
                    >
                      <div>
                        <strong>{budgetItem.category}</strong>
                        <p className="transaction-meta">
                          Gasto {formatCurrency(budgetItem.spent)}
                          {budgetItem.budgetAmount !== null
                            ? ` de ${formatCurrency(budgetItem.budgetAmount)}`
                            : " sem orcamento definido"}
                        </p>
                      </div>

                      <div className="budget-status-values">
                        <strong
                          className={
                            budgetItem.remaining !== null && budgetItem.remaining < 0
                              ? "expense-text"
                              : "income-text"
                          }
                        >
                          {budgetItem.remaining === null
                            ? "Sem meta"
                            : budgetItem.remaining >= 0
                              ? `Restam ${formatCurrency(budgetItem.remaining)}`
                              : `Excedeu ${formatCurrency(Math.abs(budgetItem.remaining))}`}
                        </strong>
                        <span className="transaction-meta">
                          {budgetItem.percentageUsed !== null
                            ? `${budgetItem.percentageUsed.toFixed(1)}% usado`
                            : "0% usado"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="ledger-card">
              <div className="ledger-header">
                <div>
                  <p className="page-eyebrow">Planejamento</p>
                  <h3 className="ledger-title">Definir orcamento do mes</h3>
                </div>
              </div>

              <form className="budget-form" onSubmit={handleBudgetSubmit}>
                <label className="form-field">
                  <span>Categoria de saida</span>
                  <select
                    value={budgetCategoryId}
                    onChange={(event) => handleBudgetCategoryChange(event.target.value)}
                  >
                    {expenseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Valor do orcamento</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={budgetAmount}
                    onChange={(event) => setBudgetAmount(event.target.value)}
                  />
                </label>

                {budgetSuccessMessage ? (
                  <p className="success-message">{budgetSuccessMessage}</p>
                ) : null}

                <div className="form-actions budget-form-actions">
                  <button className="nav-button nav-button-primary" type="submit">
                    {isSavingBudget ? "Salvando..." : "Salvar orcamento"}
                  </button>
                </div>
              </form>
            </article>
          </div>

          <div className="category-summary-grid">
            <article className="ledger-card">
              <div className="ledger-header">
                <div>
                  <p className="page-eyebrow">Categoria</p>
                  <h3 className="ledger-title">Entradas por categoria</h3>
                </div>
                <strong className="income-text">
                  {formatCurrency(selectedMonthSummary.incomeTotal)}
                </strong>
              </div>

              {incomeCategorySummaries.length === 0 ? (
                <p className="empty-state compact-empty-state">
                  Nenhuma entrada categorizada neste mes.
                </p>
              ) : (
                <ul className="category-summary-list">
                  {incomeCategorySummaries.map((categorySummary) => (
                    <li
                      className="category-summary-item"
                      key={`income-${categorySummary.category}`}
                    >
                      <div>
                        <strong>{categorySummary.category}</strong>
                        <p className="transaction-meta">
                          {categorySummary.transactionCount} transa
                          {categorySummary.transactionCount === 1 ? "cao" : "coes"}
                          {categorySummary.percentage !== null
                            ? ` - ${categorySummary.percentage.toFixed(1)}% do total`
                            : ""}
                        </p>
                      </div>
                      <strong className="income-text">
                        {formatCurrency(categorySummary.total)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="ledger-card">
              <div className="ledger-header">
                <div>
                  <p className="page-eyebrow">Categoria</p>
                  <h3 className="ledger-title">Saidas por categoria</h3>
                </div>
                <strong className="expense-text">
                  {formatCurrency(selectedMonthSummary.expenseTotal)}
                </strong>
              </div>

              {expenseCategorySummaries.length === 0 ? (
                <p className="empty-state compact-empty-state">
                  Nenhuma saida categorizada neste mes.
                </p>
              ) : (
                <ul className="category-summary-list">
                  {expenseCategorySummaries.map((categorySummary) => (
                    <li
                      className="category-summary-item"
                      key={`expense-${categorySummary.category}`}
                    >
                      <div>
                        <strong>{categorySummary.category}</strong>
                        <p className="transaction-meta">
                          {categorySummary.transactionCount} transa
                          {categorySummary.transactionCount === 1 ? "cao" : "coes"}
                          {categorySummary.percentage !== null
                            ? ` - ${categorySummary.percentage.toFixed(1)}% do total`
                            : ""}
                        </p>
                      </div>
                      <strong className="expense-text">
                        {formatCurrency(categorySummary.total)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>

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

          <div className="section-actions">
            <span className="section-badge">
              {transactions.length} transa{transactions.length === 1 ? "cao" : "coes"}
            </span>

            {transactions.length > 0 ? (
              <button
                className="nav-button nav-button-danger"
                type="button"
                onClick={handleDeleteAllTransactions}
              >
                Excluir todas
              </button>
            ) : null}
          </div>
        </div>

        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
        {transactionSuccessMessage ? (
          <p className="success-message">{transactionSuccessMessage}</p>
        ) : null}

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
