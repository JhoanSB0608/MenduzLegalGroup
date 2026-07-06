import axios from 'axios';
import { API_BASE_URL } from './userService';

const API_URL = `${API_BASE_URL}/api/catalogos`;

// Helper para obtener token de autenticación
const getConfig = (options = {}) => {
  const userInfo = localStorage.getItem('userInfo');
  const token = userInfo ? JSON.parse(userInfo).token : null;
  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============================================================
// ENTIDADES PROMOTORAS
// ============================================================

/**
 * Obtiene todas las entidades promotoras registradas en el catálogo.
 * Retorna un array de { _id, nombre }.
 */
export const getEntidadesPromotoras = async () => {
  const config = getConfig();
  const { data } = await axios.get(`${API_URL}/entidades-promotoras`, config);
  return data;
};

/**
 * Guarda (upsert) una entidad promotora en el catálogo.
 * Si ya existe (mismo nombre normalizado a mayúsculas), retorna la existente.
 * @param {string} nombre - Nombre de la entidad promotora
 */
export const saveEntidadPromotora = async (nombre) => {
  const config = getConfig({ headers: { 'Content-Type': 'application/json' } });
  const { data } = await axios.post(`${API_URL}/entidades-promotoras`, { nombre }, config);
  return data;
};

// ============================================================
// SEDES / CENTROS
// ============================================================

/**
 * Obtiene todas las sedes/centros registrados en el catálogo.
 * Retorna un array de { _id, nombre }.
 */
export const getSedes = async () => {
  const config = getConfig();
  const { data } = await axios.get(`${API_URL}/sedes`, config);
  return data;
};

/**
 * Guarda (upsert) una sede/centro en el catálogo.
 * Si ya existe (mismo nombre normalizado a mayúsculas), retorna la existente.
 * @param {string} nombre - Nombre de la sede/centro
 */
export const saveSede = async (nombre) => {
  const config = getConfig({ headers: { 'Content-Type': 'application/json' } });
  const { data } = await axios.post(`${API_URL}/sedes`, { nombre }, config);
  return data;
};
