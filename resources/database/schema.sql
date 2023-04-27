-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

-- Role permissions table (many-to-many relationship between roles and permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(id),
  permission_id INTEGER REFERENCES permissions(id),
  UNIQUE (role_id, permission_id)
);

-- Insert roles
INSERT INTO roles (id, name, description) VALUES (1, 'admin', 'Administrator with full access');
INSERT INTO roles (id, name, description) VALUES (2,'user', 'User with normal access');
INSERT INTO roles (id, name, description) VALUES (3,'free', 'Free user with very limited access');

-- Insert permissions
INSERT INTO permissions (name, description) VALUES ('create_resource', 'Create a new resource');
INSERT INTO permissions (name, description) VALUES ('read_resource', 'Read a resource');
INSERT INTO permissions (name, description) VALUES ('update_resource', 'Update a resource');
INSERT INTO permissions (name, description) VALUES ('delete_resource', 'Delete a resource');
INSERT INTO permissions (name, description) VALUES ('manage_users', 'Manage users and roles');

-- Assign permissions to roles
-- Admin role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1); -- create_resource
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 2); -- read_resource
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 3); -- update_resource
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 4); -- delete_resource
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 5); -- manage_users

-- Editor role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 1); -- create_resource
INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 2); -- read_resource
INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 3); -- update_resource

-- Viewer role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES (3, 2); -- read_resource


-- should use a faster database like redis or something else.
CREATE TABLE IF NOT EXISTS phantom_tokens (
  id SERIAL PRIMARY KEY,
  phantom_token UUID UNIQUE NOT NULL,
  jwt_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  reset_token UUID,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

