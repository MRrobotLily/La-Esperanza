import { Link } from 'react-router-dom';
import type { Producto } from '../../types';
import { emojiCategoria, fmtQuetzales } from '../../utils/format';
import Badge from '../Badge';
import StarRating from '../StarRating';

interface Props {
  producto: Producto;
  promedio?: number;
  totalResenas?: number;
  nombreProductor?: string;
  to?: string;
}

export default function ProductoCard({
  producto,
  promedio = 0,
  totalResenas = 0,
  nombreProductor,
  to,
}: Props) {
  const destino = to ?? `/producto/${producto.id}`;
  return (
    <Link
      to={destino}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-float"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-alt">
        <img
          src={producto.imagenes[0]}
          alt={producto.nombre}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute left-2 top-2">
          <Badge tono="primary">
            {emojiCategoria(producto.categoria)} {producto.categoria}
          </Badge>
        </div>
        {!producto.activo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge tono="neutral">Pausado</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-ink line-clamp-1">{producto.nombre}</h3>
          <span className="shrink-0 font-display text-lg font-semibold text-primary-dark">
            {fmtQuetzales(producto.precioUnitario)}
          </span>
        </div>
        <p className="text-xs text-ink-muted line-clamp-2 min-h-[2.2em]">
          {producto.descripcion}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-light">
          <span>por {producto.unidadMedida}</span>
          <span>•</span>
          <span>{producto.cantidadDisponible} disponibles</span>
        </div>
        {(promedio > 0 || nombreProductor) && (
          <div className="mt-1 flex items-center justify-between border-t border-line pt-2">
            {promedio > 0 ? (
              <div className="flex items-center gap-1">
                <StarRating valor={promedio} tamano="sm" />
                <span className="text-[11px] text-ink-muted">({totalResenas})</span>
              </div>
            ) : (
              <span className="text-[11px] text-ink-light">Sin reseñas</span>
            )}
            {nombreProductor && (
              <span className="text-[11px] font-medium text-primary">por {nombreProductor}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
