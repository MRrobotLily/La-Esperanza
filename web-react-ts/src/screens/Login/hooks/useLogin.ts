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

  const enviar = useMutation({
    mutationFn: () => enviarCodigoSMS(telefono),
    onSuccess: ({ codigo }) => {
      setCodigoDemo(codigo);
      setPaso('codigo');
      toast.success(`Código: ${codigo}`);
    },
    onError: () => toast.error('Error al enviar código'),
  });

  const verificar = useMutation({
    mutationFn: async () => {
      const { valido, error } = await verificarCodigoSMS(telefono, codigo);
      
      if (!valido) {
        throw new Error(error || 'Código incorrecto');
      }

      const result = await iniciarSesionConTelefono(telefono, codigo);
      
      if (!result.usuario) {
        throw new Error(result.error || 'Error al iniciar sesión');
      }

      return result.usuario;
    },
    onSuccess: (usuario) => {
      iniciarSesion(usuario);
      toast.success(`¡Bienvenido ${usuario.nombre}!`);
      navigate(redirect);
    },
    onError: (error) => {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrorCodigo(mensaje);
      toast.error(mensaje);
    },
  });

  const enviarCodigo = () => {
    if (!telefono || telefono.length < 8) {
      toast.error('Ingresa un número válido');
      return;
    }
    enviar.mutate();
  };

  const reenviarCodigo = () => {
    enviarCodigo();
  };

  const verificarCodigo = () => {
    if (!codigo || codigo.length < 6) {
      toast.error('Ingresa el código completo');
      return;
    }
    verificar.mutate();
  };

  const volverPaso = () => {
    setPaso('telefono');
    setErrorCodigo(undefined);
    setCodigo('');
  };

  return {
    state: {
      paso,
      telefono,
      codigo,
      codigoDemo,
      errorCodigo,
    },
    handler: {
      setTelefono,
      setCodigo,
      enviarCodigo,
      reenviarCodigo,
      verificar: verificarCodigo,
      volverPaso,
      enviando: enviar.isPending,
      verificando: verificar.isPending,
    },
  };
}