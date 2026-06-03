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

  // Convertir "55123456" o "5512 3456" a "5512-3456"
  const formatTelefono = (tel: string): string => {
    // Si tiene espacio, convertir a guión
    if (tel.includes(' ')) {
      return tel.replace(' ', '-');
    }
    // Si tiene 8 dígitos sin separador, agregar guión automáticamente
    if (tel.length === 8 && /^\d{8}$/.test(tel)) {
      return tel.slice(0, 4) + '-' + tel.slice(4);
    }
    return tel;
  };

  const enviar = useMutation({
    mutationFn: async (telefonoToSend: string) => {
      const tel = formatTelefono(telefonoToSend);
      console.log('📱 Enviando SMS a:', tel);
      return enviarCodigoSMS(tel);
    },
    onSuccess: ({ codigo }) => {
      setCodigoDemo(codigo);
      setPaso('codigo');
      toast.success(`Código: ${codigo}`);
    },
    onError: () => toast.error('Error al enviar código'),
  });

  const verificar = useMutation({
    mutationFn: async (data: { telefono: string; codigo: string }) => {
      console.log('🔐 Verificando con datos:', data);
      
      const { valido, error } = await verificarCodigoSMS(data.telefono, data.codigo);
      
      if (!valido) {
        throw new Error(error || 'Código incorrecto');
      }

      console.log('✅ Código válido, intentando login con:', data.telefono);
      const result = await iniciarSesionConTelefono(data.telefono, data.codigo);
      
      if (!result.usuario) {
        throw new Error(result.error || 'Error al iniciar sesión');
      }

      return result.usuario;
    },
    onSuccess: (usuario) => {
      console.log('✅ Login exitoso:', usuario);
      iniciarSesion(usuario);
      toast.success(`¡Bienvenido ${usuario.nombre}!`);
      navigate(redirect);
    },
    onError: (error) => {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error:', mensaje);
      setErrorCodigo(mensaje);
      toast.error(mensaje);
    },
  });

  const enviarCodigo = () => {
    console.log('📱 Teléfono ingresado:', telefono);
    if (!telefono || telefono.length < 8) {
      toast.error('Ingresa un número válido');
      return;
    }
    enviar.mutate(telefono);
  };

  const reenviarCodigo = () => {
    enviarCodigo();
  };

  const verificarCodigo = () => {
    if (!codigo || codigo.length < 6) {
      toast.error('Ingresa el código completo');
      return;
    }
    const telefonoFormato = formatTelefono(telefono);
    console.log('📱 Teléfono original:', telefono);
    console.log('📱 Teléfono formateado:', telefonoFormato);
    console.log('🔐 Código:', codigo);
    verificar.mutate({ telefono: telefonoFormato, codigo });
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