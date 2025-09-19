import bcrypt

def hash_password(password: str) -> str:
    """
    Cria um hash seguro da senha com um salt.
    """
    # bcrypt.gensalt() gera um salt aleatório.
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha digitada corresponde ao hash.
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))