-- Desbloquear todos os usuários bloqueados
UPDATE users SET blocked = false WHERE blocked = true;