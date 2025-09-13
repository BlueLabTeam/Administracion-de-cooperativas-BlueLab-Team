# 🏡 Proyecto de Cooperativas de Vivienda – Repositorio de Pruebas

Este repositorio contiene las **pruebas iniciales** y experimentales del sistema de gestión para cooperativas de vivienda de ayuda mutua.  
Aquí se desarrollan y testean componentes antes de ser integrados en la aplicación principal.

---

## 📌 Objetivos del Repositorio

- Probar tecnologías nuevas (PHP, Docker, Apache, MySQL, etc.).
- Experimentar con la arquitectura del proyecto (MVC, conexión a BD, rutas).
- Documentar problemas y soluciones encontrados durante el desarrollo.
- Servir como espacio seguro para romper cosas sin afectar el código productivo 😅.

---

## ⚙️ Tecnologías Utilizadas

- **PHP 8.x**
- **Apache** (servidor web)
- **MySQL / MariaDB** (base de datos)
- **Docker & Docker Compose** (contenedores)
- **Composer** (gestor de dependencias)
- **Git** (control de versiones)

---

## 📂 Estructura del Repositorio

C:.
\|   .env                 # Variables de entorno
\|   docker-compose.yml   # Configuración de contenedores
\|   dockerfile           # Imagen personalizada
\|   composer.json        # Dependencias PHP
|
+---docker
\|   ---apache
\|           000-default.conf  # Configuración de Apache
|
+---public
\|   |   .htaccess        # Reescritura de rutas
|

---

## 🚀 Cómo Ejecutar el Proyecto

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/repositorio-pruebas-cooperativas.git
   cd repositorio-pruebas-cooperativas
    ```

2. Crear archivo `.env` con las variables necesarias (ejemplo en `.env.example` si existe).

3. Levantar los contenedores:

   ```bash
   docker-compose up -d
   ```

4. Acceder al proyecto en el navegador:

   ```
   http://localhost:8080
   ```

---

## 📖 Documentación Relacionada

* [Manual de instalación](docs/instalacion.md) *(en construcción)*
* [Esquema de base de datos](docs/database.md) *(en construcción)*
* [Requisitos de software](docs/requisitos.md) *(en construcción)*

---

## 👨‍💻 Equipo

* **César** – Coordinador & Backend
* **Integrante 2** – Frontend
* **Integrante 3** – Documentación

---

## ⚠️ Nota

Este repositorio es de **uso interno y académico**.
No representa aún la versión final del sistema.

---
