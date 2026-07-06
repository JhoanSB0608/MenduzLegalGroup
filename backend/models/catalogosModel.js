const mongoose = require('mongoose');

// ====================
// ENTIDAD PROMOTORA
// ====================
const entidadPromotoraSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// ====================
// SEDE / CENTRO
// ====================
const sedeSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const EntidadPromotora = mongoose.model('EntidadPromotora', entidadPromotoraSchema);
const Sede = mongoose.model('Sede', sedeSchema);

module.exports = { EntidadPromotora, Sede };
