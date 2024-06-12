export const errorMiddlewere = (err, req, res, next) => {
    err.message || (err.message = "internal server error");
    err.status || (err.status = 500);
    return res.status(err.status).json({
        succes: false,
        message: err.message
    });
};
export const TryCatch = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};
