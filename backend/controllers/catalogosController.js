const { EntidadPromotora, Sede } = require('../models/catalogosModel');

// ============================================================
// ENTIDADES PROMOTORAS
// ============================================================

// @desc    Obtener todas las entidades promotoras
// @route   GET /api/catalogos/entidades-promotoras
// @access  Private
const getEntidadesPromotoras = async (req, res) => {
  try {
    const entidades = await EntidadPromotora.find({})
      .sort({ nombre: 1 })
      .select('nombre _id');
    res.json(entidades);
  } catch (error) {
    console.error('[Catalogos] Error al obtener entidades promotoras:', error);
    res.status(500).json({ message: 'Error al obtener entidades promotoras', error: error.message });
  }
};

// @desc    Crear o retornar (upsert) una entidad promotora
// @route   POST /api/catalogos/entidades-promotoras
// @access  Private
const upsertEntidadPromotora = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: 'El nombre de la entidad promotora es requerido.' });
    }

    const nombreNormalizado = nombre.trim().toUpperCase();

    // findOneAndUpdate con upsert para evitar duplicados y retornar el doc
    const entidad = await EntidadPromotora.findOneAndUpdate(
      { nombre: nombreNormalizado },
      { nombre: nombreNormalizado },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[Catalogos] Entidad promotora upserted: "${nombreNormalizado}" (ID: ${entidad._id})`);
    res.status(201).json(entidad);
  } catch (error) {
    console.error('[Catalogos] Error al guardar entidad promotora:', error);
    res.status(500).json({ message: 'Error al guardar la entidad promotora', error: error.message });
  }
};

// ============================================================
// SEDES / CENTROS
// ============================================================

// @desc    Obtener todas las sedes
// @route   GET /api/catalogos/sedes
// @access  Private
const getSedes = async (req, res) => {
  try {
    const sedes = await Sede.find({})
      .sort({ nombre: 1 })
      .select('nombre _id');
    res.json(sedes);
  } catch (error) {
    console.error('[Catalogos] Error al obtener sedes:', error);
    res.status(500).json({ message: 'Error al obtener sedes', error: error.message });
  }
};

// @desc    Crear o retornar (upsert) una sede
// @route   POST /api/catalogos/sedes
// @access  Private
const upsertSede = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: 'El nombre de la sede es requerido.' });
    }

    const nombreNormalizado = nombre.trim().toUpperCase();

    // findOneAndUpdate con upsert para evitar duplicados y retornar el doc
    const sede = await Sede.findOneAndUpdate(
      { nombre: nombreNormalizado },
      { nombre: nombreNormalizado },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[Catalogos] Sede upserted: "${nombreNormalizado}" (ID: ${sede._id})`);
    res.status(201).json(sede);
  } catch (error) {
    console.error('[Catalogos] Error al guardar sede:', error);
    res.status(500).json({ message: 'Error al guardar la sede', error: error.message });
  }
};

module.exports = {
  getEntidadesPromotoras,
  upsertEntidadPromotora,
  getSedes,
  upsertSede,
};
