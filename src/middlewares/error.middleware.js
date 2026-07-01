//////////////////////////////////
// error.middleware.js
///////////////////////////////////
export const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error(err);

    return res.status(500).json({
        success: false,
        message: err.message
    });
};

export const validate = (schema) => (req, res, next) => {

    const { error, value } = schema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(e => e.message)
        });
    }

    req.body = value;
    next();
};
