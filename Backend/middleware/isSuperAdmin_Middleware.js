// middleware/isSuperAdmin.js

const isSuperAdmin = (req, res, next) => {
    if (!req.user.isSuperAdmin) {
        return res.status(403).json({
            message: "Access Denied. Super Admin Only."
        });
    }
    next();
};

module.exports = isSuperAdmin;
