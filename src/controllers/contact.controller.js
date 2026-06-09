import { query } from '../services/mysql.service.js'
import { bitrixRequest } from '../services/bitrix.service.js'

//////////////////////////////////////////////////////////
// LISTAR MYSQL
//////////////////////////////////////////////////////////
export const getContact = async (req, res) => {

    try {

        const rows = await query(
            'SELECT * FROM pro_clientes'
        )

        return res.status(200).json({
            success: true,
            total: rows.length,
            data: rows
        })

    } catch (error) {

        console.error('GET CONTACTS ERROR:')
        console.error(error)

        return res.status(200).json({
            success: false,
            message: 'Error al obtener los contactos',
            error: error.message
        })
    }
}

//////////////////////////////////////////////////////////
// INSERTAR MYSQL + BITRIX
//////////////////////////////////////////////////////////
export const createContact = async (req, res) => {

    try {

        //////////////////////////////////////////////////////
        // OBTENER DATOS
        //////////////////////////////////////////////////////

        const { name, email, phone } = req.body

        //////////////////////////////////////////////////////
        // VALIDACIONES
        //////////////////////////////////////////////////////

        if (!name?.trim() || !email?.trim() || !phone?.trim()) {

            return res.status(200).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            })
        }

        //////////////////////////////////////////////////////
        // VALIDAR EMAIL
        //////////////////////////////////////////////////////

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {

            return res.status(200).json({
                success: false,
                message: 'Email inválido'
            })
        }

        //////////////////////////////////////////////////////
        // VALIDAR DUPLICADOS MYSQL
        //////////////////////////////////////////////////////

        const existingContact = await query(
            `
            SELECT *
            FROM pro_clientes
            WHERE bitrix_id = ?
            LIMIT 1
            `,
            [bitrixId]
        )

        if (existingContact.length > 0) {

            return res.status(201).json({
                success: false,
                message: 'El contacto ya existe'
            })
        }

        //////////////////////////////////////////////////////
        // CREAR CONTACTO EN BITRIX24
        //////////////////////////////////////////////////////

        const bitrixResponse = await bitrixRequest(
            'crm.contact.add',
            {
                fields: {
                    NAME: name.trim(),
                    PHONE: [
                        {
                            VALUE: phone.trim(),
                            VALUE_TYPE: 'WORK'
                        }
                    ],
                    EMAIL: [
                        {
                            VALUE: email.trim().toLowerCase(),
                            VALUE_TYPE: 'WORK'
                        }
                    ]
                }
            }
        )

        //////////////////////////////////////////////////////
        // VALIDAR RESPUESTA BITRIX
        //////////////////////////////////////////////////////

        if (!bitrixResponse || !bitrixResponse.result) {

            return res.status(200).json({
                success: false,
                message: 'Bitrix24 no devolvió un ID válido',
                bitrixResponse
            })
        }

        const bitrixId = bitrixResponse.result

        //////////////////////////////////////////////////////
        // GUARDAR EN MYSQL
        //////////////////////////////////////////////////////

        const result = await query(
            `
            INSERT INTO pro_clientes
            (
                bitrix_id,
                pri_nombre,
                email,
                telefono
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                bitrixId,
                name.trim(),
                email.trim().toLowerCase(),
                phone.trim()
            ]
        )

        //////////////////////////////////////////////////////
        // RESPUESTA EXITOSA
        //////////////////////////////////////////////////////

        return res.status(201).json({
            success: true,
            message: 'Contacto creado correctamente',
            data: {
                mysqlId: result.insertId,
                bitrixId,
                name,
                email,
                phone
            }
        })

    } catch (error) {

        //////////////////////////////////////////////////////
        // LOG ERROR
        //////////////////////////////////////////////////////

        console.error('CREATE CONTACT ERROR:')
        console.error(error)

        //////////////////////////////////////////////////////
        // ERROR BITRIX
        //////////////////////////////////////////////////////

        if (error.response?.data) {

            return res.status(200).json({
                success: false,
                message: 'Error en Bitrix24',
                error: error.response.data
            })
        }

        //////////////////////////////////////////////////////
        // ERROR GENERAL
        //////////////////////////////////////////////////////

        return res.status(200).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

//////////////////////////////////////////////////////////
// ACTUALIZAR MYSQL + BITRIX
//////////////////////////////////////////////////////////
export const updateContact = async (req, res) => {
    try {

        //////////////////////////////////////////////////////
        // PARAMETROS
        //////////////////////////////////////////////////////

        const { id } = req.params
        const { name, email, phone } = req.body

        //////////////////////////////////////////////////////
        // VALIDACIONES
        //////////////////////////////////////////////////////

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            })
        }

        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios'
            })
        }

        //////////////////////////////////////////////////////
        // BUSCAR CONTACTO MYSQL
        //////////////////////////////////////////////////////

        const rows = await query(
            `
            SELECT *
            FROM pro_clientes
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        )

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contacto no encontrado'
            })
        }

        const contact = rows[0]

        //////////////////////////////////////////////////////
        // VALIDAR BITRIX ID
        //////////////////////////////////////////////////////

        if (!contact.bitrix_id) {
            return res.status(400).json({
                success: false,
                message: 'El contacto no tiene bitrix_id'
            })
        }

        //////////////////////////////////////////////////////
        // UPDATE BITRIX24
        //////////////////////////////////////////////////////

        const bitrixResponse = await bitrixRequest(
            'crm.contact.update',
            {
                id: contact.bitrix_id,
                fields: {
                    NAME: name,
                    PHONE: [
                        {
                            VALUE: phone,
                            VALUE_TYPE: 'WORK'
                        }
                    ],
                    EMAIL: [
                        {
                            VALUE: email,
                            VALUE_TYPE: 'WORK'
                        }
                    ]
                }
            }
        )

        //////////////////////////////////////////////////////
        // VALIDAR RESPUESTA BITRIX
        //////////////////////////////////////////////////////

        if (!bitrixResponse || bitrixResponse.error) {
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar en Bitrix24',
                error: bitrixResponse?.error_description || 'Error desconocido'
            })
        }

        //////////////////////////////////////////////////////
        // UPDATE MYSQL
        //////////////////////////////////////////////////////

        await query(
            `
            UPDATE pro_clientes
            SET
                pri_nombre = ?,
                email = ?,
                telefono = ?
            WHERE id = ?
            `,
            [name, email, phone, id]
        )

        //////////////////////////////////////////////////////
        // RESPUESTA
        //////////////////////////////////////////////////////

        return res.status(200).json({
            success: true,
            message: 'Contacto actualizado correctamente'
        })

    } catch (error) {

        console.error('UPDATE CONTACT ERROR:')
        console.error(error)

        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el contacto',
            error: error.message
        })
    }
}


//////////////////////////////////////////////////////////
// DELETE MYSQL + BITRIX
//////////////////////////////////////////////////////////

export const deleteContact = async (req, res) => {

    try {

        const { id } = req.params

        //////////////////////////////////////////////////////
        // VALIDAR ID
        //////////////////////////////////////////////////////

        if (!id) {

            return res.status(400).json({
                success: false,
                message: 'ID requerido'
            })
        }

        //////////////////////////////////////////////////////
        // BUSCAR CONTACTO
        //////////////////////////////////////////////////////

        const rows = await query(
            'SELECT id, bitrix_id FROM pro_clientes WHERE id = ?',
            [id]
        )

        if (rows.length === 0) {

            return res.status(204).json({
                success: false,
                message: 'Contacto no encontrado'
            })
        }

        const contact = rows[0]

        //////////////////////////////////////////////////////
        // ELIMINAR EN BITRIX
        //////////////////////////////////////////////////////

        if (contact.bitrix_id) {

            await bitrixRequest(
                'crm.contact.delete',
                {
                    id: contact.bitrix_id
                }
            )
        }

        //////////////////////////////////////////////////////
        // ELIMINAR EN MYSQL
        //////////////////////////////////////////////////////

        await query(
            'DELETE FROM pro_clientes WHERE id = ?',
            [id]
        )

        //////////////////////////////////////////////////////
        // RESPUESTA EXITOSA
        //////////////////////////////////////////////////////

        return res.status(200).json({
            success: true,
            message: 'Contacto eliminado correctamente'
        })

    } catch (error) {

        console.error('DELETE CONTACT ERROR:')
        console.error(error)

        return res.status(200).json({
            success: false,
            message: 'Error al eliminar el contacto',
            error: error.message
        })
    }
}