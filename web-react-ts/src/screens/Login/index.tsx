import { Link, Navigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../providers/AuthProvider/useAuth';
import OTPInput from './components/OTPInput';
import { useLogin } from './hooks/useLogin';

export default function Login() {
  const { usuario, cargando } = useAuth();
  const { state, handler } = useLogin();

  if (cargando) return null;
  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4">
      {/* círculos decorativos */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/[0.03]" />
      <div className="absolute left-10 top-40 h-24 w-24 rounded-full bg-accent/10" />

      <div className="relative z-10 w-full max-w-md animate-fade-up rounded-3xl bg-white p-7 shadow-float sm:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light shadow-soft">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">La Esperanza</h1>
          <p className="text-sm text-ink-muted">Sistema de productos agrícolas</p>
        </div>

        {state.paso === 'telefono' && (
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-ink">
              📱 Número de teléfono
            </label>
            <div className="flex gap-2">
              <div className="flex items-center rounded-xl border border-line bg-bg-alt px-3 text-sm font-semibold text-ink-muted">
                +502
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="1234 5678"
                value={state.telefono}
                onChange={(e) => handler.setTelefono(e.target.value)}
                maxLength={8}
                className="flex-1 rounded-xl border border-line bg-bg-alt px-4 py-3 text-lg tracking-[3px] outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-light/30"
              />
            </div>
            <Button
              bloque
              tamano="lg"
              cargando={handler.enviando}
              disabled={state.telefono.length !== 8}
              onClick={() => handler.enviarCodigo()}
            >
              Enviar código SMS
            </Button>
            <p className="text-center text-xs text-ink-light">
              Recibirás un código de 6 dígitos por mensaje de texto.
            </p>
            <p className="text-center text-xs text-ink-muted">
              ¿Primera vez aquí?{' '}
              <Link to="/registro" className="font-semibold text-primary">
                Regístrate
              </Link>
            </p>
          </div>
        )}

        {state.paso === 'codigo' && (
          <div className="flex flex-col gap-5">
            <button
              type="button"
              onClick={handler.volverPaso}
              className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary"
            >
              ← Cambiar número
            </button>
            <p className="text-sm text-ink-muted">
              Ingresa el código enviado a{' '}
              <strong className="text-ink">+502 {state.telefono}</strong>
            </p>
            <OTPInput
              valor={state.codigo}
              onCambio={handler.setCodigo}
              largo={6}
              error={!!state.errorCodigo}
            />
            {state.errorCodigo && (
              <p className="text-center text-xs font-medium text-danger">{state.errorCodigo}</p>
            )}
            {state.codigoDemo && (
              <div className="rounded-xl border border-dashed border-accent bg-accent-light/20 px-3 py-2 text-center text-xs">
                <span className="font-semibold text-[#8A6100]">Demo (simula SMS): </span>
                <span className="font-mono text-sm tracking-[4px] text-primary-dark">
                  {state.codigoDemo}
                </span>
              </div>
            )}
            <Button
              bloque
              tamano="lg"
              cargando={handler.verificando}
              disabled={state.codigo.length !== 6}
              onClick={() => handler.verificar()}
            >
              🔒 Verificar e ingresar
            </Button>
            <button
              type="button"
              onClick={() => handler.reenviarCodigo()}
              className="text-center text-xs text-ink-light"
            >
              ¿No recibiste el código?{' '}
              <span className="font-semibold text-primary">Reenviar</span>
            </button>
          </div>
        )}

        <div className="mt-7 border-t border-line pt-5">
          <p className="mb-3 text-center text-[11px] uppercase tracking-widest text-ink-light">
            Ingreso demo
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { tel: '55500001', emoji: '🧑‍🌾', label: 'Productor' },
              { tel: '55500003', emoji: '🛒', label: 'Comprador' },
              { tel: '55500004', emoji: '🏛️', label: 'Comité' },
            ].map((d) => (
              <button
                key={d.tel}
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-line bg-bg-alt py-2 text-xs font-medium text-ink-muted transition-all hover:border-primary hover:bg-primary-soft/40"
                onClick={() => {
                  handler.setTelefono(d.tel);
                  setTimeout(() => handler.enviarCodigo(), 60);
                }}
              >
                <span className="text-xl">{d.emoji}</span>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
