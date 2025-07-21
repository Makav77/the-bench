Table management:
    CREATE TABLE users
    DROP TABLE users
    SHOW TABLES

Insert data:
    INSERT INTO users VALUES {"name": "Alice", "age": 25}

Select queries:
    SELECT * FROM users
    SELECT name FROM users
    SELECT name, age FROM users

Filtering:
    SELECT * FROM users WHERE name = "Alice"
    SELECT * FROM users WHERE age > 20
    SELECT * FROM users WHERE age >= 30 AND name != "Bob"
    SELECT * FROM users WHERE name = "Alice" OR name = "Bob"

Ordering:
    SELECT * FROM users ORDER BY name
    SELECT * FROM users ORDER BY age DESC
    SELECT name FROM users ORDER BY name ASC

Updating:
    UPDATE users SET age = 26 WHERE name = "Alice"

Deleting:
    DELETE FROM users WHERE age < 30