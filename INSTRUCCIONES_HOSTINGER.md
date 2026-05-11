# 🚀 Instrucciones de Deploy Automático — UNAMIS Portal

El sistema usa **GitHub Actions** para compilar y subir automáticamente el portal a Hostinger cada vez que haces `git push`.

---

## ✅ Paso 1: Configurar los Secrets de GitHub

Ve a tu repositorio en GitHub:  
**Settings → Secrets and variables → Actions → New repository secret**

Agrega estos 10 secrets:

| Secret Name       | Valor                                    |
|-------------------|------------------------------------------|
| `DB_HOST`         | `localhost`                              |
| `DB_NAME`         | `u876493207_upagobd`                     |
| `DB_USER`         | `u876493207_userupago`                   |
| `DB_PASS`         | `17080602Diu26*`                         |
| `ADMIN_USER`      | `LELLC`                                  |
| `ADMIN_PASS`      | `Diu2026**`                              |
| `FTP_SERVER`      | *(servidor FTP en Hostinger → FTP Accounts)* |
| `FTP_USERNAME`    | *(usuario FTP de Hostinger)*             |
| `FTP_PASSWORD`    | *(contraseña FTP de Hostinger)*          |
| `FTP_SERVER_DIR`  | `/public_html/`                          |

> ⚠️ Los datos del FTP los encuentras en Hostinger → **Administrador de archivos → Cuentas FTP**

---

## ✅ Paso 2: Crear carpeta `uploads/` en el servidor (solo la primera vez)

Desde el **Administrador de archivos de Hostinger**, crea manualmente la carpeta:

```
public_html/
└── uploads/
    ├── cedulas/
    ├── nacimientos/
    ├── titulos/
    ├── certificados/
    ├── fotos/
    ├── comprobantes/
    └── otros/
```

> Esta carpeta no se sube por Git/FTP porque contiene archivos de usuarios.

---

## ✅ Paso 3: Importar la base de datos (solo la primera vez)

1. Ve a **Hostinger → Bases de datos → phpMyAdmin**
2. Importa el archivo `database_schema.sql` de este repositorio

---

## 🔄 Flujo de Deploy Automático

```bash
# Cada vez que quieras actualizar producción:
git add .
git commit -m "Tu descripción"
git push
```

GitHub Actions se encarga de:
1. 📥 Instalar dependencias
2. 🔨 Compilar React (`npm run build`)
3. 📋 Copiar `api.php`, `api-banco.php` al build
4. 🔐 Generar `config.php` desde los Secrets (seguro)
5. 🌐 Subir todo a `public_html/` vía FTP

---

## 📋 Checklist de primer deploy

- [ ] 8 Secrets configurados en GitHub
- [ ] Carpeta `uploads/` creada en Hostinger con sus subcarpetas
- [ ] Base de datos importada en phpMyAdmin
- [ ] Primer `git push` ejecutado
- [ ] Verificar en `https://upago.unamis.edu.py/api.php?test` que devuelve JSON
