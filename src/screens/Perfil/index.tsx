import Screen from '../../layout/Screen';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SelectorUbicacion from '../../components/SelectorUbicacion';
import SelectorFoto from '../../components/SelectorFoto';
import Badge from '../../components/Badge';
import StarRating from '../../components/StarRating';
import {
  etiquetaRol,
  fmtFecha,
  fmtFechaHora,
  fmtTelefono,
  iniciales,
} from '../../utils/format';
import { usePerfil } from './hooks/usePerfil';

export default function Perfil() {
  const p = usePerfil();

  if (!p.usuario) return null;
  const u = p.usuario;

  const estadoTono =
    u.estado === 'activa' ? 'success' : u.estado === 'suspendida' ? 'warning' : 'danger';

  return (
    <Screen titulo="Mi perfil" subtitulo="Revisa y actualiza tu información personal.">
      {/* Tarjeta resumen */}
      <div className="mb-5 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-primary-soft/40 to-white p-6 shadow-soft md:flex-row md:items-start">
        <div className="relative">
          {u.fotoPerfil ? (
            <img
              src={u.fotoPerfil}
              alt={u.nombre}
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-soft"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary text-2xl font-bold text-white shadow-soft">
              {iniciales(u.nombre, u.apellido)}
            </div>
          )}
          <div className="mt-3">
            <SelectorFoto
              onFoto={p.subirFoto}
              yaHayFoto={!!u.fotoPerfil}
              textoAccion="Subir foto"
              textoReemplazar="Cambiar foto"
              variante="outline"
            />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="font-display text-2xl font-semibold text-primary-dark">
            {u.nombre} {u.apellido}
          </h2>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <Badge tono="primary">{etiquetaRol(u.rol)}</Badge>
            <Badge tono={estadoTono}>{u.estado.toUpperCase()}</Badge>
            <span className="text-xs text-ink-muted">
              Miembro desde {fmtFecha(u.creadoEn)}
            </span>
          </div>
          {p.reputacion.total > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <StarRating valor={p.reputacion.promedio} etiqueta />
              <span className="text-xs text-ink-muted">
                ({p.reputacion.total}{' '}
                {p.reputacion.total === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>
          )}
          <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-light">Teléfono</dt>
              <dd className="font-medium text-ink">{fmtTelefono(u.telefono)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-light">DPI</dt>
              <dd className="font-medium text-ink">
                {u.dpi.slice(0, 4)} {u.dpi.slice(4, 9)} {u.dpi.slice(9)}
              </dd>
            </div>
            {u.direccion && (
              <div className="md:col-span-2">
                <dt className="text-xs text-ink-light">Dirección</dt>
                <dd className="font-medium text-ink">
                  {u.direccion}
                  {u.municipio && `, ${u.municipio}`}
                  {u.departamento && `, ${u.departamento}`}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Motivo suspensión (si aplica) */}
      {u.estado === 'suspendida' && u.motivoSuspension && (
        <div className="mb-5 rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <p className="text-sm font-semibold text-[#8A6100]">
            ⚠️ Tu cuenta está suspendida
          </p>
          <p className="mt-1 text-sm text-ink-muted">Motivo: {u.motivoSuspension}</p>
          {u.suspendidoHasta && (
            <p className="text-xs text-ink-light">
              Hasta: {fmtFecha(u.suspendidoHasta)}
            </p>
          )}
        </div>
      )}

      {/* Datos editables */}
      <div className="rounded-3xl bg-white p-5 shadow-soft md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-primary-dark">
            Datos personales
          </h3>
          {!p.editando && (
            <Button variante="outline" tamano="sm" onClick={() => p.setEditando(true)}>
              ✏️ Editar
            </Button>
          )}
        </div>

        {p.editando ? (
          <form className="flex flex-col gap-4" onSubmit={p.submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombres"
                {...p.form.register('nombre')}
                error={p.form.formState.errors.nombre?.message}
              />
              <Input
                label="Apellidos"
                {...p.form.register('apellido')}
                error={p.form.formState.errors.apellido?.message}
              />
            </div>
            <Input
              label="Dirección"
              placeholder="Aldea / cantón / colonia"
              {...p.form.register('direccion')}
              error={p.form.formState.errors.direccion?.message}
            />
            <SelectorUbicacion
              requerido
              departamento={p.form.watch('departamento')}
              municipio={p.form.watch('municipio')}
              onCambioDepartamento={(v) =>
                p.form.setValue('departamento', v, { shouldValidate: true })
              }
              onCambioMunicipio={(v) =>
                p.form.setValue('municipio', v, { shouldValidate: true })
              }
              errorDepartamento={p.form.formState.errors.departamento?.message}
              errorMunicipio={p.form.formState.errors.municipio?.message}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variante="ghost" onClick={() => p.setEditando(false)} type="button">
                Cancelar
              </Button>
              <Button cargando={p.guardando} type="submit">
                Guardar cambios
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-light">Nombre completo</dt>
              <dd className="font-medium text-ink">
                {u.nombre} {u.apellido}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-light">Teléfono</dt>
              <dd className="font-medium text-ink">{fmtTelefono(u.telefono)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-ink-light">Dirección</dt>
              <dd className="font-medium text-ink">
                {u.direccion || '—'}
                {u.municipio && `, ${u.municipio}`}
                {u.departamento && `, ${u.departamento}`}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {/* Reseñas recibidas — reputación de la persona */}
      {u.rol !== 'comite' && (
        <div className="mt-5 rounded-3xl bg-white p-5 shadow-soft">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-primary-dark">
              ⭐ Reseñas recibidas
            </h3>
            {p.reputacion.total > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold text-primary-dark">
                  {p.reputacion.promedio.toFixed(1)}
                </span>
                <StarRating valor={p.reputacion.promedio} tamano="sm" />
                <span className="text-xs text-ink-muted">
                  · {p.reputacion.total}{' '}
                  {p.reputacion.total === 1 ? 'reseña' : 'reseñas'}
                </span>
              </div>
            )}
          </div>

          {p.cargandoReputacion ? (
            <p className="text-sm text-ink-muted">Cargando reseñas…</p>
          ) : p.calificaciones.length === 0 ? (
            <p className="rounded-2xl bg-bg-alt p-4 text-sm text-ink-muted">
              Todavía no tienes reseñas. Al finalizar acuerdos, la otra parte
              podrá calificarte y su opinión aparecerá aquí.
            </p>
          ) : (
            <>
              {/* Distribución por estrellas */}
              <div className="mb-4 grid gap-1">
                {([5, 4, 3, 2, 1] as const).map((n) => {
                  const cantidad = p.reputacion.distribucion[n];
                  const porcentaje =
                    p.reputacion.total > 0
                      ? (cantidad / p.reputacion.total) * 100
                      : 0;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-12 text-ink-muted">{n} ★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-ink-muted">
                        {cantidad}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Listado de reseñas */}
              <ul className="divide-y divide-line">
                {p.calificaciones.map((c) => {
                  const autor = p.mapaUsuarios.get(c.autorId);
                  const rolAutor =
                    c.direccion === 'comprador_a_productor'
                      ? 'Comprador'
                      : 'Productor';
                  return (
                    <li
                      key={c.id}
                      className="flex gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      {autor?.fotoPerfil ? (
                        <img
                          src={autor.fotoPerfil}
                          alt={autor.nombre}
                          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                          {autor
                            ? iniciales(autor.nombre, autor.apellido)
                            : '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-ink">
                            {autor
                              ? `${autor.nombre} ${autor.apellido}`
                              : 'Usuario'}
                          </p>
                          <Badge tono="neutral">{rolAutor}</Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <StarRating valor={c.estrellas} tamano="sm" />
                          <span className="text-xs text-ink-light">
                            {fmtFechaHora(c.creadoEn)}
                          </span>
                        </div>
                        {c.resena && (
                          <p className="mt-2 text-sm text-ink">{c.resena}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Foto DPI */}
      {u.dpiFotoUrl && (
        <div className="mt-5 rounded-3xl bg-white p-5 shadow-soft">
          <h3 className="mb-3 font-display text-lg font-semibold text-primary-dark">
            📄 Documento de identidad
          </h3>
          <img
            src={u.dpiFotoUrl}
            alt="DPI"
            className="w-full max-w-sm rounded-2xl border border-line object-cover"
          />
          <p className="mt-2 text-xs text-ink-light">
            Esta foto se utilizó para validar que no existiera otra cuenta con
            el mismo DPI.
          </p>
        </div>
      )}
    </Screen>
  );
}
