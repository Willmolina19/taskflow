import { describe, it, expect } from 'vitest';
import Tarea from '../src/models/Tarea.js';

describe('Modelo Tarea', () => {
  it('debe exigir un titulo', () => {
    const tarea = new Tarea();
    expect(tarea.validateSync().errors.titulo).toBeDefined();
  });

  it('debe tener prioridad media por defecto', () => {
    const tarea = new Tarea({ titulo: 'Estudiar Docker' });
    expect(tarea.prioridad).toBe('media');
  });

  it('debe estar incompleta por defecto', () => {
    const tarea = new Tarea({ titulo: 'Configurar CI/CD' });
    expect(tarea.completada).toBe(false);
  });

  it('debe rechazar una prioridad invalida', () => {
    const tarea = new Tarea({
      titulo: 'Preparar entrega',
      prioridad: 'urgente',
    });
    expect(tarea.validateSync().errors.prioridad).toBeDefined();
  });

  it('debe aceptar una tarea valida', () => {
    const tarea = new Tarea({
      titulo: 'Publicar imagen Docker',
      prioridad: 'alta',
    });
    expect(tarea.validateSync()).toBeUndefined();
  });
});
