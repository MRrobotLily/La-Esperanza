import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  enviarCodigoSMS,
  registrarUsuario,
  validarDPI,
  verificarCodigoSMS,
} from '../../../api/authApi';
import {
  type PerfilRegistroInput,
  perfilRegistroSchema,
} from '../../../schemas/authSchemas';
import { useAuth } from '../../../providers/AuthProvider/useAuth';

export type PasoReg = 'telefono' | 'codigo' | 'dpi' | 'perfil';

export function useRegistro() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const [paso, setPaso] = useState<PasoReg>(params.get('telefono') ? 'dpi' : 'telefono');
  const [telefono, setTelefono] = useState(
    (params.get('telefono') ?? '').replace(/^\+?502/, ''),
  );
  const [codigo, setCodigo] = useState('');
  const [codigoDemo, setCodigoDemo] = useState<string | null>(null);
  const [errorCodigo, setErrorCodigo] = useState<string | undefined>();
  const [dpi, setDpi] = useState('');
  const [dpiFoto, setDpiFoto] = useState<string | null>(null);
  const [errorDpi, setErrorDpi] = useState<string | undefined>();

  const form = useForm<PerfilRegistroInput>({
    resolver: zodResolver(perfilRegistroSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      direccion: '',
      departamento: '',
      municipio: '',
      rol: 'comprador',
    },
  });

  const telefonoFull = telefono.length === 8 
    ? telefono.slice(0, 4) + '-' + telefono.slice(4)
    : telefono;

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
      if (!r.valido) {
        throw new Error(r.error || 'Código incorrecto.');
      }
    },
    onSuccess: () => setPaso('dpi'),
    onError: (e: Error) => {
      setErrorCodigo(e.message);
      toast.error(e.message);
    },
  });

  const validar = useMutation({
    mutationFn: async () => {
      if (dpi.length !== 13) throw new Error('El DPI debe tener 13 dígitos.');
      if (!dpiFoto) throw new Error('Debes capturar la foto del DPI.');
      const r = await validarDPI(dpi);
      if (!r.valido) {
        throw new Error(r.error || 'DPI inválido.');
      }
    },
    onSuccess: () => setPaso('perfil'),
    onError: (e: Error) => {
      setErrorDpi(e.message);
      toast.error(e.message);
    },
  });

  const finalizar = useMutation({
    mutationFn: async (datos: PerfilRegistroInput) => {
      const result = await registrarUsuario(
        telefonoFull,
        datos.nombre,
        datos.apellido,
        datos.rol,
        dpi,
        datos.direccion,
        datos.departamento,
        datos.municipio
      );
      if (!result.usuario) {
        throw new Error(result.error || 'Error al registrar');
      }
      iniciarSesion(result.usuario);
      return result.usuario;
    },
    onSuccess: (u) => {
      toast.success(`¡Cuenta creada! Bienvenido, ${u.nombre}.`);
      navigate('/', { replace: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    state: {
      paso,
      telefono,
      codigo,
      codigoDemo,
      errorCodigo,
      dpi,
      dpiFoto,
      errorDpi,
      form,
    },
    handler: {
      setTelefono: (v: string) => setTelefono(v.replace(/\D/g, '').slice(0, 8)),
      setCodigo: (v: string) => {
        setCodigo(v);
        setErrorCodigo(undefined);
      },
      setDpi: (v: string) => {
        setDpi(v.replace(/\D/g, '').slice(0, 13));
        setErrorDpi(undefined);
      },
      setDpiFoto,
      setPaso,
      enviarCodigo: () => enviar.mutate(),
      verificarCodigo: () => verificar.mutate(),
      validarDPI: () => validar.mutate(),
      submit: form.handleSubmit((d) => finalizar.mutate(d)),
      enviando: enviar.isPending,
      verificando: verificar.isPending,
      validando: validar.isPending,
      guardando: finalizar.isPending,
    },
  };
}