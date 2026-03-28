import { useState, type FormEvent } from "react";
import { loginUser, registerUser } from "../services/authService";
import type { AuthResponse } from "../types/auth";

interface AuthProps {
  onAuthSuccess: (response: AuthResponse) => void;
}

type AuthMode = "login" | "register";

function Auth({ onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response =
        mode === "login"
          ? await loginUser({ email, password })
          : await registerUser({ fullName, email, password });

      onAuthSuccess(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel autenticar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <div>
        <p className="page-eyebrow">Acesso</p>
        <h1 className="brand-title">Save Money</h1>
        <p className="helper-text">
          Crie sua conta para salvar transacoes no PostgreSQL e acessar o sistema com login.
        </p>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Acesso ao sistema">
        <button
          className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
          type="button"
          onClick={() => setMode("login")}
        >
          Entrar
        </button>

        <button
          className={`auth-tab ${mode === "register" ? "is-active" : ""}`}
          type="button"
          onClick={() => setMode("register")}
        >
          Criar conta
        </button>
      </div>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {mode === "register" ? (
            <label className="form-field form-field-full">
              <span>Nome completo</span>
              <input
                type="text"
                placeholder="Seu nome"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>
          ) : null}

          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input
              type="password"
              placeholder="Minimo de 6 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>

        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

        <div className="form-actions">
          <button className="nav-button nav-button-primary" type="submit">
            {isSubmitting
              ? "Enviando..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Auth;
