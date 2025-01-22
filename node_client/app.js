/**
 * `mysql2/promise` MySQL veritabanına bağlanmak ve sorgular yürütmek için kullanılır.
 *
 * @module mysql2/promise 
 */
const mysql = require('mysql2/promise');

/**
 * `@elastic/elasticsearch` modülü, Elasticsearch ile etkileşimde bulunmak için kullanılır.
 * Bu modül, Elasticsearch'e veri indeksleme, arama ve diğer işlemleri gerçekleştirmek için çeşitli yöntemler sunar.
 *
 * @module @elastic/elasticsearch
 */ 
const { Client } = require('@elastic/elasticsearch');

/**
 * `faker` modülü, test ve geliştirme gibi çeşitli amaçlar için sahte veriler oluşturmak için kullanılır.
 * Rastgele isimler, adresler, telefon numaraları ve diğer veri türlerini oluşturmak için geniş bir yöntem yelpazesi sunar.
 * 
 * @module faker
 */
const faker = require('faker');


const elasticClient = new Client({ node: process.env.ELASTICSEARCH_HOST });

(async () => {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD
    });
    
    const shard_count = 2;
    // Rastgele veriler oluştur ve shard'lara dağıt
    for (let i = 1; i <= 300000; i++) {
        const shard = `shard${(i % shard_count) + 1}_db`;
        const name = faker.name.findName();
        const email = faker.internet.email();
        const sex = faker.name.gender();
        
        const query = `INSERT INTO ${shard}.test_table (name, email, sex) VALUES (?, ?, ?)`;
        await pool.query(query, [name, email, sex]);
    }

    console.log('Data distributed.');

    // Elasticsearch'e indeksleme
    for (let i = 1; i <= 300000; i++) {
        const shard = `shard${(i % shard_count) + 1}_db`;
        const [rows] = await pool.query(`SELECT * FROM ${shard}.test_table WHERE id = ?`, [i]);
        const document = rows[0];

        await elasticClient.index({
            index: 'central_index',
            document: {
                id: i,
                name: document.name,
                // EPosta adresi üzerinden arama yapılmayacağı için indexlenmesine gerek yok
                // email: document.email,
                sex: document.sex,
                shard: shard
            }
        });
    }

    console.log('Data indexed to Elasticsearch.');
})();

