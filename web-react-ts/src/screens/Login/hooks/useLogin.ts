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

export type Paso = 'rol' | 'telefono' | 'codigo';
export type RolSeleccionado = 'productor' | 'comprador' | 'comite' | null;

export function useLogin() {
  const [paso, setPaso] = useState<Paso>('rol');
  const [rolSeleccionado, setRolSeleccionado] = useState<RolSeleccionado>(null);
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
        throw new Error(result.error || 'No existe una cuenta con este número');
      }
      
      // Validar que el rol coincide con el seleccionado
      if (rolSeleccionado && result.usuario.rol !== rolSeleccionado) {
        const labels: Record<string, string> = {
          productor: 'Productor',
          comprador: 'Comprador',
          comite: 'Comité'
        };
        throw new Error(`No hay una cuenta de ${labels[rolSeleccionado]} con ese número. ¿Desea crear una?`);
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

  const seleccionarRol = (rol: 'productor' | 'comprador' | 'comite') => {
    setRolSeleccionado(rol);
    setPaso('telefono');
  };

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
    if (paso === 'codigo') {
      setPaso('telefono');
      setErrorCodigo(undefined);
      setCodigo('');
    } else if (paso === 'telefono') {
      setPaso('rol');
      setTelefono('');
    }
  };

  return {
    state: {
      paso,
      telefono,
      codigo,
      codigoDemo,
      errorCodigo,
      rolSeleccionado,
    },
    handler: {
      setTelefono,
      setCodigo,
      seleccionarRol,
      enviarCodigo,
      reenviarCodigo,
      verificar: verificarCodigo,
      volverPaso,
      enviando: enviar.isPending,
      verificando: verificar.isPending,
    },
  };
}