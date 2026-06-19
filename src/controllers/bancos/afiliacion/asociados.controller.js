//////////////////////////////////////////////////////////
// asociados.controller.js
//////////////////////////////////////////////////////////
import 
    asociadosService 
from '../../../services/bancos/afiliacion/asociados.service.js';
///////////////////////////////////////////////////////
class AsociadosController {

    async getAll(req, res) {

        try {

            const data = await asociadosService.getAll();

            res.status(200).json(data);

        } catch (error) {

            res.status(500).json({
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

            res.json(asociado);

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }

    async create(req, res) {

        try {

            const id = await asociadosService.create(req.body);

            res.status(201).json({
                success: true,
                id
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }

    async update(req, res) {

        try {

            const { id } = req.params;

            await asociadosService.update(id, req.body);

            res.json({
                success: true,
                message: 'Asociado actualizado'
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }

    async delete(req, res) {

        try {

            const { id } = req.params;

            await asociadosService.delete(id);

            res.json({
                success: true,
                message: 'Asociado eliminado'
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }
}

export default new AsociadosController();