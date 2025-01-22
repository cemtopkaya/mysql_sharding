# Mimari

```plaintext
                              +-------------------+
                              |     İstemci       |
                              |   (Node.js Uyg.)  |
                              +--------+----------+
                                       |      
                        +--------------+--------------+  
                        |                             |  
                        v                             v  
              +---------+----------+       +----------+----------+
              |     Query Router   |       |  Central Indexing   |
              |       ProxySQL     |       |       Server        |
              +--------------------+       |   Elasticsearch     |
                         |                 +---------------------+
                         |
     +-------------------+----------------+
     |                                    |
     v                                    v
+----+-----------+               +--------+-------+
| MySQL Shard 1  |               | MySQL Shard 2  |
| shard1_db      |               | shard2_db      |
+----------------+               +----------------+
```

# Sharding (Parçalama)
Shard’lama, büyük veri kümelerini daha küçük, yönetilebilir parçalara bölme işlemidir. Bu işlem, veritabanı performansını artırmak ve ölçeklenebilirliği sağlamak için kullanılır. Shard’lama, verilerin yatay olarak bölünmesi anlamına gelir; yani, her shard, veritabanının tam bir kopyası yerine, veritabanının bir alt kümesini içerir.

Proje kapsamında, veriler iki MySQL shard’ına bölünmüştür: `shard1_db` ve `shard2_db`. Her shard, belirli bir veri alt kümesini saklar ve bu sayede sorguların daha hızlı ve verimli bir şekilde işlenmesi sağlanır. ProxySQL, istemciden gelen sorguları uygun shard’a yönlendirir. Bu, veritabanı yükünü dengeler ve performansı artırır.

Shard’lama işlemi, verilerin belirli bir mantıksal kurala göre dağıtılmasıyla gerçekleştirilir. Örneğin, bu projede veriler, belirli bir sayıya göre shard’lara dağıtılmıştır. Bu sayede, her shard, veritabanının belirli bir bölümünü içerir ve sorgular, ilgili shard’a yönlendirilerek işlenir.


# Query Router (ProxSQL)
ProxySQL, istemciden gelen sorguları uygun MySQL shard'larına yönlendiren bir sorgu yönlendiricisidir. Bu projede kullanılan ProxySQL'in ayar dosyası `proxysql.cnf` olarak adlandırılmıştır ve aşağıdaki bileşenleri içerir:

- `admin_variables`: ProxySQL'in yönetim arayüzü için gerekli ayarları içerir. Örneğin, `admin_credentials` yönetim arayüzüne erişim için gerekli kullanıcı adı ve şifreyi tanımlar.
- `mysql_variables`: ProxySQL'in MySQL trafiğini işlemek için kullandığı iş parçacıklarının sayısını belirler. Bu projede `threads=4` olarak ayarlanmıştır.
- `mysql_servers`: ProxySQL'in yönlendireceği MySQL sunucularını tanımlar. Bu projede iki MySQL shard'ı bulunmaktadır: `mysql_shard_1` ve `mysql_shard_2`. Her biri farklı bir `hostgroup` ile ilişkilendirilmiştir.
- `mysql_users`: ProxySQL üzerinden MySQL sunucularına erişim sağlayacak kullanıcıları tanımlar. Bu projede `root` kullanıcısı tanımlanmıştır.
- `mysql_query_rules`: Gelen sorguların hangi shard'a yönlendirileceğini belirleyen kuralları içerir. Örneğin, `rule_id=1` kuralı `shard1_db` içeren sorguları `hostgroup=1`'e yönlendirir.

Bu ayarlar sayesinde ProxySQL, istemciden gelen sorguları uygun shard'a yönlendirir ve veritabanı yükünü dengeler. Bu da sistemin performansını artırır ve ölçeklenebilirliği sağlar.


# Merkezi Endeksleme (Elasticsearch)
Shard’lara bölünmüş veriler, her bir sunucuda farklı veri parçalarını saklar. Merkezi endeksleme bu parçaları bir arada tutar ve birleşik bir görünüm sağlar.

Merkezi endekslemenin temel maksadı, büyük ve dağıtık bir sistemdeki veri parçalarının (örneğin, shard’lara bölünmüş veritabanları) hızlı ve etkili bir şekilde aranabilir hâle getirilmesidir. Bu, özellikle verinin birçok farklı kaynaktan geldiği, parçalar hâlinde saklandığı ve doğrudan sorgulanmasının zor olduğu durumlarda kritik öneme sahiptir.

Endeksleme sayesinde, tüm shard’lara rastgele sorgular göndermek yerine yalnızca ilgili sunuculara ulaşılır. Bu da sistemin genel yükünü azaltır ve performansı artırır.
