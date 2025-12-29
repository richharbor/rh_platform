const validateOnboarding = (req, res, next) => {
    const required = [
        'email', 'password', 'firstName', 'lastName', 'requestedRoleId',
        'companyName', 'businessAddress', 'city', 'country', 'primaryContactEmail'
    ];

    const missing = required.filter(field => !req.body[field]);

    if (missing.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            fields: missing
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (req.body.password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long'
        });
    }

    next();
};

module.exports = {
    validateOnboarding
};