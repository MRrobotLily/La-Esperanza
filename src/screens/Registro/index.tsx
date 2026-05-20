import { Link, Navigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SelectorUbicacion from '../../components/SelectorUbicacion';
import { useAuth } from '../../providers/AuthProvider/useAuth';
import OTPInput from '../Login/components/OTPInput';
import DPICapture from './components/DPICapture';
import { useRegistro } from './hooks/useRegistro';

export default function Registro() {
  const { usuario, cargando } = useAuth();
  const { state, handler } = useRegistro();

  if (cargando) return null;
  if (usuario) return <Navigate to="/" replace />;

  const pasos = ['telefono', 'codigo', 'dpi', 'perfil'] as const;
  const indiceActual = pasos.indexOf(state.paso);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto w-full max-w-lg px-4 py-6 md:py-10">
        <Link to="/login" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          ← Volver al ingreso
        </Link>

        <header className="mb-5">
          <h1 className="font-display text-2xl font-semibold text-primary-dark">Crear cuenta</h1>
          <p className="text-sm text-ink-muted">
            Valida tu teléfono, tu DPI y completa tu perfil.
          </p>
        </header>

        {/* stepper */}
        <div className="mb-6 flex items-center gap-2">
          {pasos.map((p, i) => (
            <div key={p} className="flex flex-1 items-center">
              <div
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  i <= indiceActual ? 'bg-primary text-white' : 'bg-bg-alt text-ink-light',
                ].join(' ')}
              >
                {i + 1}
              </div>
              {i < pasos.length - 1 && (
                <div
                  className={[
                    'mx-1 h-[3px] flex-1 rounded-full',
                    i < indiceActual ? 'bg-primary' : 'bg-bg-alt',
                  ].join(' ')}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
          {state.paso === 'telefono' && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl text-primary-dark">📱 Tu número de teléfono</h2>
              <p className="text-sm text-ink-muted">
                Te enviaremos un código de 6 dígitos para verificarlo.
              </p>
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
            </div>
          )}

          {state.paso === 'codigo' && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => handler.setPaso('telefono')}
                className="self-start text-sm font-medium text-primary"
              >
                ← Cambiar número
              </button>
              <h2 className="font-display text-xl text-primary-dark">🔐 Ingresa el código</h2>
              <p className="text-sm text-ink-muted">
                Enviado a <strong>+502 {state.telefono}</strong>
              </p>
              <OTPInput valor={state.codigo} onCambio={handler.setCodigo} error={!!state.errorCodigo} />
              {state.errorCodigo && (
                <p className="text-center text-xs font-medium text-danger">{state.errorCodigo}</p>
              )}
              {state.codigoDemo && (
                <div className="rounded-xl border border-dashed border-accent bg-accent-light/20 px-3 py-2 text-center text-xs">
                  <span className="font-semibold text-[#8A6100]">Demo: </span>
                  <span className="font-mono tracking-[4px] text-primary-dark">
                    {state.codigoDemo}
                  </span>
                </div>
              )}
              <Button
                bloque
                tamano="lg"
                cargando={handler.verificando}
                disabled={state.codigo.length !== 6}
                onClick={() => handler.verificarCodigo()}
              >
                Verificar código
              </Button>
              <button
                type="button"
                onClick={() => handler.enviarCodigo()}
                className="text-center text-xs text-ink-light"
              >
                ¿No lo recibiste?{' '}
                <span className="font-semibold text-primary">Reenviar</span>
              </button>
            </div>
          )}

          {state.paso === 'dpi' && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl text-primary-dark">🪪 Validación de DPI</h2>
              <p className="text-sm text-ink-muted">
                Se valida que no exista otra cuenta con el mismo DPI (activa, suspendida o cancelada).
              </p>
              <Input
                label="Número de DPI"
                placeholder="13 dígitos"
                inputMode="numeric"
                value={state.dpi}
                onChange={(e) => handler.setDpi(e.target.value)}
                maxLength={13}
                error={state.errorDpi}
                hint={state.errorDpi ? undefined : 'Solo los 13 dígitos, sin espacios ni guiones.'}
              />
              <DPICapture onFoto={handler.setDpiFoto} fotoActual={state.dpiFoto ?? undefined} />
              <Button
                bloque
                tamano="lg"
                cargando={handler.validando}
                disabled={state.dpi.length !== 13 || !state.dpiFoto}
                onClick={() => handler.validarDPI()}
              >
                Validar y continuar
              </Button>
            </div>
          )}

          {state.paso === 'perfil' && (
            <form className="flex flex-col gap-4" onSubmit={handler.submit}>
              <h2 className="font-display text-xl text-primary-dark">🧑 Completa tu perfil</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nombres"
                  placeholder="Juan Antonio"
                  {...state.form.register('nombre')}
                  error={state.form.formState.errors.nombre?.message}
                />
                <Input
                  label="Apellidos"
                  placeholder="Pérez Gómez"
                  {...state.form.register('apellido')}
                  error={state.form.formState.errors.apellido?.message}
                />
              </div>
              <Input
                label="Dirección"
                placeholder="Aldea / cantón / colonia"
                {...state.form.register('direccion')}
                error={state.form.formState.errors.direccion?.message}
              />
              <SelectorUbicacion
                requerido
                departamento={state.form.watch('departamento') ?? ''}
                municipio={state.form.watch('municipio') ?? ''}
                onCambioDepartamento={(v) =>
                  state.form.setValue('departamento', v, { shouldValidate: true })
                }
                onCambioMunicipio={(v) =>
                  state.form.setValue('municipio', v, { shouldValidate: true })
                }
                errorDepartamento={state.form.formState.errors.departamento?.message}
                errorMunicipio={state.form.formState.errors.municipio?.message}
              />
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">
                  ¿Cómo vas a usar la app?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { rol: 'productor', emoji: '🧑‍🌾', titulo: 'Soy productor', desc: 'Quiero vender mis productos.' },
                    { rol: 'comprador', emoji: '🛒', titulo: 'Soy comprador', desc: 'Quiero comprar productos.' },
                  ].map((op) => {
                    const activo = state.form.watch('rol') === op.rol;
                    return (
                      <button
                        type="button"
                        key={op.rol}
                        onClick={() => state.form.setValue('rol', op.rol as 'productor' | 'comprador')}
                        className={[
                          'flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all',
                          activo
                            ? 'border-primary bg-primary-soft/50'
                            : 'border-line bg-white hover:border-primary-light',
                        ].join(' ')}
                      >
                        <span className="text-2xl">{op.emoji}</span>
                        <span className="text-sm font-semibold text-ink">{op.titulo}</span>
                        <span className="text-[11px] text-ink-muted">{op.desc}</span>
                      </button>
                    );
                  })}
                </div>
                {state.form.formState.errors.rol && (
                  <p className="mt-1 text-xs font-medium text-danger">
                    {state.form.formState.errors.rol.message}
                  </p>
                )}
              </div>
              <Button type="submit" bloque tamano="lg" cargando={handler.guardando}>
                Crear cuenta
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
