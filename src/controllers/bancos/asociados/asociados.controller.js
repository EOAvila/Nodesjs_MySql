//////////////////////////////////////////////////////////
// asociados.controller.js
//////////////////////////////////////////////////////////
import asociadosService from '../../../services/bancos/asociados/asociados.service.js';
import { asociadoSchema } from '../../../modules/asociados/validator.js';
class AsociadosController {

    async getAll(req, res) {
        try {
            const data = await asociadosService.getAll();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const asociado = await asociadosService.getById(id);

            if (!asociado) {
                return res.status(404).json({
                    success: false,
                    message: 'Asociado no encontrado'
                });
            }

            return res.json(asociado);

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async create(req, res) {
        try {

            // ✔ VALIDACIÓN BIEN UBICADA
            const { error, value } = asociadoSchema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Datos inválidos",
                    errors: error.details
                });
            }

            const id = await asociadosService.create(value);

            return res.status(201).json({
                success: true,
                id
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;

            await asociadosService.update(id, req.body);

            return res.json({
                success: true,
                message: 'Asociado actualizado'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            await asociadosService.delete(id);

            return res.json({
                success: true,
                message: 'Asociado eliminado'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

/////////////////////////////////////////
export default new AsociadosController();