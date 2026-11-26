import { describe, it, expect, vi, afterEach } from 'vitest';

import {
  API_URL,
  listarTareas,
  crearTarea,
  eliminarTarea,
} from '../src/api.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Cliente API de TaskFlow', () => {
  it('debe listar las tareas', async () => {
    const tareas = [{ titulo: 'Estudiar Docker' }];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => tareas,
    });

    vi.stubGlobal('fetch', fetchMock);

    expect(await listarTareas()).toEqual(tareas);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/tareas`,
      expect.any(Object)
    );
  });

  it('debe crear una tarea mediante POST', async () => {
    const tarea = {
      titulo: 'Configurar CI/CD',
      prioridad: 'alta',
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => tarea,
    });

    vi.stubGlobal('fetch', fetchMock);

    expect(await crearTarea(tarea)).toEqual(tarea);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/tareas`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(tarea),
      })
    );
  });

  it('debe eliminar una tarea mediante DELETE', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });

    vi.stubGlobal('fetch', fetchMock);

    expect(await eliminarTarea('123')).toBeNull();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/tareas/123`,
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('debe manejar errores de la API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Titulo obligatorio',
        }),
      })
    );

    await expect(crearTarea({}))
      .rejects.toThrow('Titulo obligatorio');
  });
});
