-- =============================================================================
-- Inicializacion opcional de MySQL
-- =============================================================================
-- Este script solo se ejecuta cuando el volumen de datos esta vacio. El
-- esquema y los datos de la aplicacion los gestiona Laravel con migraciones
-- y seeders, por lo que aqui solo se fijan ajustes de servidor.
-- =============================================================================

SET GLOBAL time_zone = '+00:00';

SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
