Proyecto Gestcoop del grupo Bluelab
Integrantes:

-Agustin Fleitas
-Cesar Perez
-Sebastian Garcia

Para ejecutar este proyecto, únicamente es necesario levantar el proceso a través de PHP. Esto se puede hacer dándole doble clic al archivo launcher.bat, o si se desea, ejecutar el comando correspondiente para levantar los contenedores:

docker compose -f docker-compose.dev.yml up -d --build

Problema con la librería de variables del .env
No se logró configurar la librería necesaria para traer con PHP las variables del archivo .env. Si se desea conectar y manejar todo a través de los contenedores, deberá ir al archivo .env y cambiar las siguientes variables:

DB_HOST="192.168.5.50"
DB_NAME="agustin_fleitas"
DB_USER="agustin.fleitas"
DB_PASSWORD="56751742"

por:

DB_HOST=gestcoop_db
DB_NAME=proyecto2025
DB_USER=bluelabuser
DB_PASSWORD=bluelabuser

Luego, también se deberá modificar el siguiente archivo ubicado en src\config\Database.php y cambiar las variables de conexión:

$host = "192.168.5.50";
$db = "bluelab";
$user = "agustin.fleitas";
$pass = "56751742";

por:

$host = getenv('DB_HOST');
$db = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASSWORD');

Notas adicionales:
Lo de sistemas operativos se le mostrará al profesor con una OVA a través de otro medio, como lo indicó coordinación.

Entrar como usuario administrador:
Credenciales:
gmail: admin@gestcoop.com
contraseña: adminadmin

gmail: juan@correo.com
contraseña: prueba123