# RH Server (Platform Backend)

## Setup & Run (Fresh Database)

If you are starting with a fresh database or have reset it, run the following commands in order to set up the schema and initial data.

**Note:** Ensure your `.env` file is set up with `DATABASE_URL` and other required variables.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
This creates all tables (`users`, `admins`, `leads`, `admin_roles`, etc.).
```bash
DB_SSL=true npx sequelize-cli db:migrate --config platform/config/config.js --migrations-path platform/migrations --models-path platform/models
```

### 3. Seed Initial Data
This creates the default roles (Super Admin, Ops, RM, etc.) and the initial Admin user (`admin@richharbor.com` / `1q2w3e`).
```bash
DB_SSL=true npx sequelize-cli db:seed:all --config platform/config/config.js --seeders-path platform/seeders --models-path platform/models
```

### 4. Start the Server
```bash
DB_SSL=true npm start
```

---

## Folder Structure
- **platform/config**: Database configuration for the platform connection.
- **platform/migrations**: Sequelize migration files.
- **platform/models**: Sequelize models for the platform.
- **platform/seeders**: Initial data scripts.
- **platform/controllers**: API logic.
- **platform/routes**: API route definitions.
