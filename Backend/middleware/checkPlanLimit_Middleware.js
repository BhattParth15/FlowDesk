const { checkLimit } = require("../controllers/subscriptionController.js");

const checkPlanLimit = (moduleName) => {
    return async (req, res, next) => {
        try {
            const companyId = req.user.companyId;
            const bulkCount = req.body?.items?.length || 1;
            const allowed = await checkLimit(companyId, moduleName,bulkCount);
            
            if (!allowed) {
                return res.status(403).json({
                    message: `${moduleName} limit reached for your plan`,
                    module: moduleName
                });
            }
            next();
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    };
};
module.exports = checkPlanLimit;