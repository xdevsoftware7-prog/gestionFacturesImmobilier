const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'gestionFacturesImmobilier' 
};

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // 1. Création de la base de données
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(`Base de données "${dbConfig.database}" vérifiée/créée.`);
        await connection.changeUser({ database: dbConfig.database });

        // 2. Définition des tables
        const tables = [
            `CREATE TABLE IF NOT EXISTS token_blacklist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token TEXT NOT NULL,
                expire_at DATETIME NOT NULL
            );`
        ];

        // 3. Exécution de la création des tables
        for (const sql of tables) {
            await connection.query(sql);
        }

        console.log("la table token_blacklist est bien été créée avec succès.");
        await connection.end();

    } catch (error) {
        console.error("Erreur lors de la création de la table token_blacklist :", error);
    }
}

createDatabase();