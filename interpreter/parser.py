import ply.lex as lex
import ply.yacc as yacc

reserved = {
    'select': 'SELECT',
    'from': 'FROM',
    'where': 'WHERE',
    'insert': 'INSERT',
    'into': 'INTO',
    'values': 'VALUES',
}

tokens = [
    'IDENTIFIER', 'STRING', 'NUMBER',
    'LBRACE', 'RBRACE', 'COMMA', 'EQUALS', 'COLON'
] + list(reserved.values())

t_LBRACE = r'\{'
t_RBRACE = r'\}'
t_COMMA = r','
t_EQUALS = r'='
t_COLON = r':'

t_ignore = ' 	'

def t_IDENTIFIER(t):
    r'[a-zA-Z_][a-zA-Z0-9_]*'
    t.type = reserved.get(t.value.lower(), 'IDENTIFIER')
    return t

def t_STRING(t):
    r'"([^\\"]|\\.)*"'
    t.value = t.value[1:-1]
    return t

def t_NUMBER(t):
    r'\d+(\.\d+)?'
    try:
        t.value = int(t.value)
    except:
        t.value = float(t.value)
    return t

def t_newline(t):
    r'\n+'
    t.lexer.lineno += len(t.value)

def t_error(t):
    raise SyntaxError(f"Illegal character '{t.value[0]}'")

lexer = lex.lex()

def p_statement_select(p):
    'statement : SELECT field_list FROM IDENTIFIER WHERE IDENTIFIER EQUALS STRING'
    p[0] = ('select', p[2], p[4], (p[6], p[8]))

def p_statement_insert(p):
    'statement : INSERT INTO IDENTIFIER VALUES json_object'
    p[0] = ('insert', p[3], p[5])

def p_field_list(p):
    '''field_list : IDENTIFIER
                  | IDENTIFIER COMMA field_list'''
    if len(p) == 2:
        p[0] = [p[1]]
    else:
        p[0] = [p[1]] + p[3]

def p_json_object(p):
    'json_object : LBRACE json_fields RBRACE'
    p[0] = p[2]

def p_json_fields(p):
    '''json_fields : STRING COLON value
                   | STRING COLON value COMMA json_fields'''
    if len(p) == 4:
        p[0] = {p[1]: p[3]}
    else:
        p[0] = {p[1]: p[3], **p[5]}

def p_value(p):
    '''value : STRING
             | NUMBER'''
    p[0] = p[1]

def p_error(p):
    raise SyntaxError("Syntax error in input")

parser = yacc.yacc()

def parse_query(query, data):
    ast = parser.parse(query)
    if ast[0] == 'select':
        _, fields, table, condition = ast
        key, value = condition
        result = []
        for row in data:
            if row.get(key) == value:
                result.append({f: row.get(f) for f in fields})
        return result, False
    elif ast[0] == 'insert':
        _, table, obj = ast
        data.append(obj)
        return "OK", True
