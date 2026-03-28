import { useState, type FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveTransaction } from "../services/transactionService";
import type { Transaction, TransactionType } from "../types/transaction";

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
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getTodayDateValue());
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function resetForm() {
    setTitle("");
    setAmount("");
    setType("income");
    setCategory("");
    setDate(getTodayDateValue());
    setDescription("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!title.trim() || !category.trim() || !date) {
      setErrorMessage("Preencha titulo, categoria e data antes de salvar.");
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Informe um valor maior que zero.");
      return;
    }

    const newTransaction: Transaction = {
      id: uuidv4(),
      title: title.trim(),
      amount: parsedAmount,
      type,
      category: category.trim(),
      date,
      description: description.trim() || undefined,
    };

    saveTransaction(newTransaction);
    setErrorMessage("");
    resetForm();
    onSave();
  }

  return (
    <main className="page">
      <section className="card">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Cadastro</p>
            <h2 className="page-title">Nova transacao</h2>
            <p className="helper-text">
              Registre entradas e saidas para alimentar o resumo da dashboard.
            </p>
          </div>
        </div>

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
                onChange={(event) => setType(event.target.value as TransactionType)}
              >
                <option value="income">Entrada</option>
                <option value="expense">Saida</option>
              </select>
            </label>

            <label className="form-field">
              <span>Categoria</span>
              <input
                type="text"
                placeholder="Ex.: Alimentacao"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
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
              Salvar transacao
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default NewTransaction;
