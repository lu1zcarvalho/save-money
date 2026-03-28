import { useEffect, useState, type FormEvent } from "react";
import { getAccounts } from "../services/accountService";
import { getCategories } from "../services/categoryService";
import { saveTransaction } from "../services/transactionService";
import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type { TransactionType } from "../types/transaction";

interface NewTransactionProps {
  onSave: () => void;
  onCancel: () => void;
}

function getTodayDateValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function NewTransaction({ onSave, onCancel }: NewTransactionProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("income");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(getTodayDateValue());
  const [description, setDescription] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFormOptions() {
      try {
        const [loadedAccounts, loadedCategories] = await Promise.all([
          getAccounts(),
          getCategories(),
        ]);

        if (!isMounted) {
          return;
        }

        setAccounts(loadedAccounts);
        setCategories(loadedCategories);
        setAccountId(loadedAccounts[0]?.id ?? "");

        const defaultCategory = loadedCategories.find(
          (category) => category.type === "income",
        );

        setCategoryId(defaultCategory?.id ?? "");
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar contas e categorias.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    }

    void loadFormOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCategories = categories.filter((category) => category.type === type);

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);

    const nextCategories = categories.filter(
      (category) => category.type === nextType,
    );

    setCategoryId(nextCategories[0]?.id ?? "");
  }

  function resetForm() {
    setTitle("");
    setAmount("");
    setType("income");
    setDate(getTodayDateValue());
    setDescription("");
    setCategoryId(categories.find((category) => category.type === "income")?.id ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!title.trim() || !date || !accountId || !categoryId) {
      setErrorMessage("Preencha titulo, conta, categoria e data antes de salvar.");
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Informe um valor maior que zero.");
      return;
    }

    setIsSubmitting(true);

    try {
      await saveTransaction({
        title: title.trim(),
        amount: parsedAmount,
        type,
        accountId,
        categoryId,
        date,
        description: description.trim() || undefined,
      });

      setErrorMessage("");
      resetForm();
      onSave();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar a transacao.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Cadastro</p>
            <h2 className="page-title">Nova transacao</h2>
            <p className="helper-text">
              Agora o formulario envia os dados para a API e o PostgreSQL.
            </p>
          </div>
        </div>

        {isLoadingOptions ? (
          <p className="empty-state">Carregando contas e categorias...</p>
        ) : (
          <form className="transaction-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Titulo</span>
                <input
                  type="text"
                  placeholder="Ex.: Salario ou Mercado"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Valor</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Tipo</span>
                <select
                  value={type}
                  onChange={(event) =>
                    handleTypeChange(event.target.value as TransactionType)
                  }
                >
                  <option value="income">Entrada</option>
                  <option value="expense">Saida</option>
                </select>
              </label>

              <label className="form-field">
                <span>Conta</span>
                <select
                  value={accountId}
                  onChange={(event) => setAccountId(event.target.value)}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Categoria</span>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Data</span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>

              <label className="form-field form-field-full">
                <span>Descricao opcional</span>
                <textarea
                  rows={4}
                  placeholder="Detalhes para lembrar o contexto da transacao"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
            </div>

            {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

            <div className="form-actions">
              <button className="nav-button" type="button" onClick={onCancel}>
                Voltar
              </button>

              <button className="nav-button nav-button-primary" type="submit">
                {isSubmitting ? "Salvando..." : "Salvar transacao"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default NewTransaction;
