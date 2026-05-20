import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  enviarCodigoSMS,
  iniciarSesionConTelefono,
  verificarCodigoSMS,
} from '../../../api/authApi';
import { useAuth } from '../../../providers/AuthProvider/useAuth';

export type Paso = 'telefono' | 'codigo';

export function useLogin() {
  const [paso, setPaso] = useState<Paso>('telefono');
  const [telefono, setTelefono] = useState('');
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState<string | undefined>();
  const [codigoDemo, setCodigoDemo] = useState<string | null>(null);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const telefonoFull = `+502${telefono}`;

  const enviar = useMutation({
    mutationFn: () => enviarCodigoSMS(telefonoFull),
    onSuccess: ({ codigo }) => {
      setCodigoDemo(codigo);
      setPaso('codigo');
      toast.success('Código enviado por SMS');
    },
    onError: () => toast.error('No se pudo enviar el código.'),
  });

  const verificar = useMutation({
    mutationFn: async () => {
      const r = await verificarCodigoSMS(telefonoFull, codigo);
      if (!r.ok) {
        if (r.motivo === 'bloqueado') {
          const hasta = r.bloqueadoHasta ? new Date(r.bloqueadoHasta) : null;
          throw new Error(
            hasta
              ? `Demasiados intentos. Intenta de nuevo a las ${hasta.toLocaleTimeString()}.`
              : 'Demasiados intentos. Espera unos minutos.',
          );
        }
        if (r.motivo === 'expirado') throw new Error('El código expiró. Solicita uno nuevo.');
        throw new Error(
          r.restantes !== undefined
            ? `Código incorrecto. Te quedan ${r.restantes} intento(s).`
            : 'Código incorrecto.',
        );
      }
      const usuario = await iniciarSesionConTelefono(telefonoFull);
      return usuario;
    },
    onSuccess: (usuario) => {
      if (!usuario) {
        navigate(`/registro?telefono=${encodeURIComponent(telefonoFull)}`);
        return;
      }
      iniciarSesion(usuario);
      toast.success(`¡Bienvenido, ${usuario.nombre}!`);
      navigate(redirect, { replace: true });
    },
    onError: (e: Error) => {
      setErrorCodigo(e.message);
      toast.error(e.message);
    },
  });

  return {
    state: { paso, telefono, codigo, codigoDemo, errorCodigo },
    handler: {
      setTelefono: (v: string) => setTelefono(v.replace(/\D/g, '').slice(0, 8)),
      setCodigo: (v: string) => {
        setCodigo(v);
        setErrorCodigo(undefined);
      },
      volverPaso: () => {
        setPaso('telefono');
        setCodigo('');
        setErrorCodigo(undefined);
      },
      enviarCodigo: () => enviar.mutate(),
      reenviarCodigo: () => enviar.mutate(),
      verificar: () => verificar.mutate(),
      enviando: enviar.isPending,
      verificando: verificar.isPending,
    },
  };
}
