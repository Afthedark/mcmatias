import pymysql

# Instalar PyMySQL como driver
pymysql.install_as_MySQLdb()

# Parche para simular mysqlclient 2.2.7 (necesario para Django 5/6)
if not hasattr(pymysql, 'version_info'):
    pymysql.version_info = (2, 2, 7, 'final', 0)
else:
    # A veces hay que forzarlo en el módulo "MySQLdb" simulado
    try:
        import MySQLdb
        MySQLdb.version_info = (2, 2, 7, 'final', 0)
    except ImportError:
        pass
