'use strict';

/** Error con codigo HTTP y codigo de negocio estable para los clientes. */
class HttpError extends Error {
  constructor(status, codigo, mensaje, detalles) {
    super(mensaje);
    this.name = 'HttpError';
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

module.exports = { HttpError };
