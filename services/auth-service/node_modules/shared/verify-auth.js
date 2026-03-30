const axios = require('axios');

const verifyAuth = (serviceAutorise) => {
    return async (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ message: 'Token manquant' });

        try {
            // Appel au microservice auth-service
            const response = await axios.get('http://auth-service:3001/api/auth/verify', {
                headers: { 'Authorization': token }
            });

            const user = response.data.user;

            // Vérification : l'utilisateur appartient-il au bon service ?
            if (response.data.valid && (user.service === serviceAutorise || user.role === 'admin')) {
                req.user = user;
                next();
            } else {
                res.status(403).json({ message: `Accès interdit : réservé au service ${serviceAutorise}` });
            }
        } catch (error) {
            res.status(401).json({ message: 'Session invalide' });
        }
    };
};

module.exports = { verifyAuth };