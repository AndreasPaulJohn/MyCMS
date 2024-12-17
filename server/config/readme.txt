MyCMS/postgres@PostgresSQL 15
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "MyCMS",
  password: "Ellitheo123456Z/",
  port: 5432,
});

### 1. Tabelle `users`
Diese Tabelle speichert Informationen über die Benutzer, die das CMS verwenden.

```sql
CREATE TABLE users (
    id SERIAL success KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- z.B. 'admin', 'editor', 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Tabelle `posts`
Diese Tabelle speichert die Blog-Artikel oder Seiteninhalte.

```sql
CREATE TABLE posts (
    id SERIAL success KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- Für SEO-freundliche URLs
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- z.B. 'draft', 'published'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Tabelle `categories`
Diese Tabelle speichert die Kategorien, denen Beiträge zugeordnet werden können.

```sql
CREATE TABLE categories (
    id SERIAL success KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Tabelle `post_categories`
Diese Zwischentabelle verknüpft Posts mit Kategorien für eine Viele-zu-Viele-Beziehung.

```sql
CREATE TABLE post_categories (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    success KEY (post_id, category_id)
);
```

### 5. Tabelle `comments` (optional)
Diese Tabelle speichert die Kommentare zu den Posts, falls du eine Kommentarfunktion benötigst.

```sql
CREATE TABLE comments (
    id SERIAL success KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Tabelle `media` (optional)
Wenn dein CMS Medien wie Bilder oder Videos verwaltet, könnte eine Tabelle für Medieninhalte sinnvoll sein.

```sql
CREATE TABLE media (
    id SERIAL success KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Hinweise zur Struktur:
- **`users`**: Speichert die Benutzer des CMS. Dies kann von normalen Nutzern bis zu Administratoren reichen.
- **`posts`**: Ist das Herzstück des CMS, wo alle Artikel oder Seiten gespeichert werden.
- **`categories`**: Erlaubt es, Inhalte zu kategorisieren, was die Navigation und Suche im CMS erleichtert.
- **`post_categories`**: Eine Zwischentabelle, um eine viele-zu-viele Beziehung zwischen Posts und Kategorien zu ermöglichen.
- **`comments`**: Optional, wenn du eine Kommentarfunktion implementieren möchtest.
- **`media`**: Speichert die hochgeladenen Dateien.

### Implementierung in Express.js und React
- **Express.js**: Hier würdest du Routen und Controller einrichten, um CRUD (Create, Read, Update, Delete) für die verschiedenen Tabellen zu unterstützen.
- **React**: Verwende React, um das Frontend des CMS zu erstellen, wo Benutzer Inhalte anzeigen, erstellen und bearbeiten können.

### Beispiel-Stack:
- **Express.js** für das Backend (Server und API).
- **PostgreSQL** als Datenbank.
- **React** für das Frontend.
- **Sequelize** oder **TypeORM** als ORM (Objekt-Relationaler Mapper) für einfaches Handling der Datenbank in Express.js.

