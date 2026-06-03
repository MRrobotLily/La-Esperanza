import { Link } from 'react-router-dom';
import Screen from '../../layout/Screen';
import Input from '../../components/Input';
import Select from '../../components/Select';
import TextArea from '../../components/TextArea';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ImagenesUpload from './components/ImagenesUpload';
import { useProductoForm } from './hooks/useProductoForm';
import { CATEGORIAS, UNIDADES } from '../../schemas/productoSchema';

export default function ProductoForm() {
  const { state, handler } = useProductoForm();
  const { form, editando, cargando, guardando } = state;
  const errores = form.formState.errors;

  if (cargando) return <Screen><Loader /></Screen>;

  const tipos = form.watch('tiposEntrega');
  const toggleTipo = (t: 'recoger' | 'delivery') => {
    const nuevo = tipos.includes(t) ? tipos.filter((x) => x !== t) : [...tipos, t];
    form.setValue('tiposEntrega', nuevo, { shouldValidate: true });
  };

  return (
    <Screen
      titulo={editando ? 'Editar producto' : 'Nuevo producto'}
      subtitulo="Completa los datos siguiendo las buenas prácticas de la app."
      volver={
        <Link to="/mis-productos" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          ← Mis productos
        </Link>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handler.submit}>
        <div className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-soft md:grid-cols-2">
          <Input
            label="Nombre del producto"
            placeholder="Ej. Tomate de cosecha"
            {...form.register('nombre')}
            error={errores.nombre?.message}
          />
          <Select label="Categoría" {...form.register('categoria')} error={errores.categoria?.message}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2">
            <TextArea
              label="Descripción"
              placeholder="Explica la calidad, origen o cosecha de tu producto."
              rows={4}
              {...form.register('descripcion')}
              error={errores.descripcion?.message}
            />
          </div>
        </div>

        <div className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-soft md:grid-cols-4">
          <Input
            label="Precio unitario (Q)"
            type="number"
            step="0.01"
            {...form.register('precioUnitario')}
            error={errores.precioUnitario?.message}
          />
          <Input
            label="Precio por mayor (Q)"
            type="number"
            step="0.01"
            {...form.register('precioMayor')}
            error={errores.precioMayor?.message}
          />
          <Input
            label="Desde cantidad"
            type="number"
            hint="Aplica precio mayor a partir de esta cantidad"
            {...form.register('cantidadMayor')}
            error={errores.cantidadMayor?.message}
          />
          <Select label="Unidad" {...form.register('unidadMedida')} error={errores.unidadMedida?.message}>
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
          <Input
            label="Cantidad disponible"
            type="number"
            {...form.register('cantidadDisponible')}
            error={errores.cantidadDisponible?.message}
          />
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <ImagenesUpload
            imagenes={form.watch('imagenes')}
            onCambio={(imgs) => form.setValue('imagenes', imgs, { shouldValidate: true })}
            error={errores.imagenes?.message as string | undefined}
          />
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <p className="mb-2 text-sm font-semibold text-ink">Tipo de entrega</p>
          <div className="flex flex-wrap gap-2">
            {[
              { k: 'recoger' as const, emoji: '📍', titulo: 'Punto de recogida' },
              { k: 'delivery' as const, emoji: '🚚', titulo: 'Delivery' },
            ].map((op) => {
              const activo = tipos.includes(op.k);
              return (
                <button
                  key={op.k}
                  type="button"
                  onClick={() => toggleTipo(op.k)}
                  className={[
                    'inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all',
                    activo
                      ? 'border-primary bg-primary-soft text-primary-dark'
                      : 'border-line bg-white text-ink-muted hover:border-primary-light',
                  ].join(' ')}
                >
                  <span>{op.emoji}</span>
                  {op.titulo}
                </button>
              );
            })}
          </div>
          {errores.tiposEntrega && (
            <p className="mt-2 text-xs font-medium text-danger">
              {errores.tiposEntrega.message as string}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            to="/mis-productos"
            className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-ink-muted hover:bg-bg-alt"
          >
            Cancelar
          </Link>
          <Button type="submit" tamano="lg" cargando={guardando}>
            {editando ? 'Guardar cambios' : '✅ Publicar producto'}
          </Button>
        </div>
      </form>
    </Screen>
  );
}
