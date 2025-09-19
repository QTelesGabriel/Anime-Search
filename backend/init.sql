SELECT 'CREATE DATABASE animesearch'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'animesearch')\gexec