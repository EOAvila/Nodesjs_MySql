import { pool } from "../config/db.js";

///////////////////////////////////////////////////////////
// GUARDAR EVENTO
///////////////////////////////////////////////////////////

export const guardarEvento = async ({
    entityType,
    entityId,
    eventType
}) => {

    const sql = `
        INSERT INTO queue_events
        (
            entity_type,
            entity_id,
            event_type
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
    `;

    const [result] =
        await pool.query(
            sql,
            [
                entityType,
                entityId,
                eventType
            ]
        );

    return result.insertId;
};

///////////////////////////////////////////////////////////
// OBTENER EVENTOS PENDIENTES
///////////////////////////////////////////////////////////

export const obtenerEventosPendientes =
async () => {

    const sql = `
        SELECT *
        FROM queue_events
        WHERE status = 'PENDING'
        ORDER BY id ASC
        LIMIT 20
    `;

    const [rows] =
        await pool.query(sql);

    return rows;
};

///////////////////////////////////////////////////////////
// MARCAR PROCESANDO
///////////////////////////////////////////////////////////

export const marcarProcesando =
async (id) => {

    await pool.query(
        `
        UPDATE queue_events
        SET status='PROCESSING'
        WHERE id=?
        `,
        [id]
    );
};

///////////////////////////////////////////////////////////
// MARCAR DONE
///////////////////////////////////////////////////////////

export const marcarDone =
async (id) => {

    await pool.query(
        `
        UPDATE queue_events
        SET
            status='DONE',
            processed_at=NOW()
        WHERE id=?
        `,
        [id]
    );
};

///////////////////////////////////////////////////////////
// MARCAR FAILED
///////////////////////////////////////////////////////////

export const marcarFailed =
async (id) => {

    await pool.query(
        `
        UPDATE queue_events
        SET
            status='FAILED',
            retries = retries + 1
        WHERE id=?
        `,
        [id]
    );
};