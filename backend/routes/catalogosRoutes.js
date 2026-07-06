const express = require('express');
const router = express.Router();
const {
  getEntidadesPromotoras,
  upsertEntidadPromotora,
  getSedes,
  upsertSede,
} = require('../controllers/catalogosController.js');
const { protect } = require('../middleware/authMiddleware.js');

// --- Entidades Promotoras ---
// GET  /api/catalogos/entidades-promotoras  -> Listar todas
// POST /api/catalogos/entidades-promotoras  -> Crear/upsert una entidad
router
  .route('/entidades-promotoras')
  .get(protect, getEntidadesPromotoras)
  .post(protect, upsertEntidadPromotora);

// --- Sedes / Centros ---
// GET  /api/catalogos/sedes  -> Listar todas
// POST /api/catalogos/sedes  -> Crear/upsert una sede
router
  .route('/sedes')
  .get(protect, getSedes)
  .post(protect, upsertSede);

module.exports = router;
