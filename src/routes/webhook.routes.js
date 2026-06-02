import { Router } from 'express'
import { query } from '../services/mysql.service.js'
import { bitrixRequest } from '../services/bitrix.service.js'

const router = Router()

//////////////////////////////////////////////////////////
// WEBHOOK BITRIX
//////////////////////////////////////////////////////////

router.post('/', async (req, res) => {

    try {

        console.log(req.body)

        //////////////////////////////////////////////////////
        // EVENTO CONTACTO ACTUALIZADO
        //////////////////////////////////////////////////////

        if (req.body.event === 'ONCRMCONTACTUPDATE') {

            const contactId = req.body.data.FIELDS.ID

            //////////////////////////////////////////////////
            // OBTENER CONTACTO BITRIX
            //////////////////////////////////////////////////

            const response = await bitrixRequest(
                'crm.contact.get',
                {
                    id: contactId
                }
            )

            const contact = response.result

            //////////////////////////////////////////////////
            // UPDATE MYSQL
            //////////////////////////////////////////////////

            await query(
                `
                UPDATE contacts
                SET
                    name = ?,
                    email = ?,
                    phone = ?
                WHERE bitrix_id = ?
                `,
                [
                    contact.NAME,
                    contact.EMAIL?.[0]?.VALUE || '',
                    contact.PHONE?.[0]?.VALUE || '',
                    contactId
                ]
            )
        }

        res.send('OK')

    } catch (error) {

        console.error(error)

        res.status(500).json(error.message)
    }
})

//////////////////////////////////////////////////
export default router
