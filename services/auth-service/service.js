const JWT_SECRET = "jwt-secret";
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.json());

// Connexion MySQL
const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'',
    database:'gestionFacturesImmobilier',
    waitForConnections: true,
    connectionLimit: 10
});




// Endpoint de register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nom, prenom, email, password, role, service } = req.body;

        // 1. Vérification : l'utilisateur existe-t-il déjà ?
        const [existingUser] = await pool.execute(
            'SELECT id FROM utilisateurs WHERE email = ?', 
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // 2. Sécurité : Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insertion dans la base de données
        const [result] = await pool.execute(
            'INSERT INTO utilisateurs (nom, prenom, email, password, role, service) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, prenom, email, hashedPassword, role, service]
        );

        // 4. Réponse de succès
        res.status(201).json({ 
            message: "Utilisateur créé avec succès",
            userId: result.insertId 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement." });
    }
});


// Middleware de vérification du token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: 'Token requis' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        req.user = decoded;
        next();
    });
};



app.listen(3001, () => {
    console.log('Auth service running on port 3001');
});