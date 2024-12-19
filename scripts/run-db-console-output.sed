s,^psql:[^:]+:[0-9]+: NOTICE:  ,,
s,^psql:[^:]+:([0-9]+): ERROR: +(.+),\n*\n* ERROR: \2 (Line \1)\n*\n,
s,^LINE [0-9]+: +(.+),       \1\n,
/^ +\^$/d
/drop cascades to/d
/^Successfully copied/d
/^DO$/d
/^DROP SCHEMA/d
/^GRANT/d
/^CREATE PROCEDURE/d
/^CALL/d
/^CREATE SCHEMA/d
/^CREATE TABLE$/d
/^INSERT [0-9]+ [0-9]+$/d
/^DELETE [0-9]+$/d