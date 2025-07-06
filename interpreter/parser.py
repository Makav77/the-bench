import ply.lex as lex
import ply.yacc as yacc

reserved = {
    'select': 'SELECT',
    'from': 'FROM',
    'where': 'WHERE',
    'insert': 'INSERT',
    'into': 'INTO',
    'values': 'VALUES',
    'update': 'UPDATE',
    'delete': 'DELETE',
    'set': 'SET',
    'drop': 'DROP',
    'table': 'TABLE',
    'create': 'CREATE',
    'show': 'SHOW',
    'tables': 'TABLES',
    'order': 'ORDER',
    'by': 'BY',
    'desc': 'DESC',
    'asc': 'ASC',
    'and': 'AND',
    'or': 'OR'
}

tokens = [
    'IDENTIFIER', 'STRING', 'NUMBER',
    'LBRACE', 'RBRACE', 'COMMA', 'EQUALS',
    'COLON', 'STAR', 'LESST', 'GREATERT', 'LESSEQUALS', 'GREATEREQUALS', 'NOTEQUALS', 
] + list(reserved.values())

precedence = (
    ('left', 'OR'),
    ('left', 'AND'),
)

t_LBRACE = r'\{'
t_RBRACE = r'\}'
t_COMMA = r','
t_EQUALS = r'='
t_COLON = r':'
t_STAR = r'\*'
t_LESSEQUALS = r'<='
t_GREATEREQUALS = r'>='
t_NOTEQUALS = r'!='
t_LESST = r'<'
t_GREATERT = r'>'

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
    'statement : SELECT field_list FROM IDENTIFIER'
    p[0] = ('select', p[2], p[4], None, None)

def p_statement_select_where(p):
    'statement : SELECT field_list FROM IDENTIFIER WHERE condition'
    p[0] = ('select', p[2], p[4], p[6], None)

def p_statement_select_order(p):
    '''statement : SELECT field_list FROM IDENTIFIER ORDER BY IDENTIFIER
                 | SELECT field_list FROM IDENTIFIER ORDER BY IDENTIFIER ASC
                 | SELECT field_list FROM IDENTIFIER ORDER BY IDENTIFIER DESC'''
    if len(p) == 8:
        order = (p[7], 'ASC')
    else:
        order = (p[7], p[8].upper())
    p[0] = ('select', p[2], p[4], None, order)

def p_statement_select_where_order(p):
    '''statement : SELECT field_list FROM IDENTIFIER WHERE condition ORDER BY IDENTIFIER
                 | SELECT field_list FROM IDENTIFIER WHERE condition ORDER BY IDENTIFIER ASC
                 | SELECT field_list FROM IDENTIFIER WHERE condition ORDER BY IDENTIFIER DESC'''
    if len(p) == 13:
        order = (p[11], p[12].upper())
    else:
        order = (p[11], 'ASC')
    p[0] = ('select', p[2], p[4], p[6], order)

def p_statement_insert(p):
    'statement : INSERT INTO IDENTIFIER VALUES json_object'
    p[0] = ('insert', p[3], p[5])

def p_statement_update(p):
    'statement : UPDATE IDENTIFIER SET assignments WHERE IDENTIFIER comparison_op value'
    p[0] = ('update', p[2], p[4], (p[6], p[7], p[8]))

def p_assignments_single(p):
    'assignments : IDENTIFIER EQUALS value'
    p[0] = {p[1]: p[3]}

def p_assignments_multiple(p):
    'assignments : IDENTIFIER EQUALS value COMMA assignments'
    p[0] = {p[1]: p[3], **p[5]}

def p_statement_delete(p):
    'statement : DELETE FROM IDENTIFIER WHERE IDENTIFIER comparison_op value'
    p[0] = ('delete', p[3], (p[5], p[6], p[7]))

def p_statement_drop(p):
    'statement : DROP TABLE IDENTIFIER'
    p[0] = ('drop', p[3])

def p_statement_create(p):
    'statement : CREATE TABLE IDENTIFIER'
    p[0] = ('create', p[3])

def p_statement_show_tables(p):
    'statement : SHOW TABLES'
    p[0] = ('show_tables',)

def p_comparison_op(p):
    '''comparison_op : EQUALS
                     | LESST
                     | GREATERT
                     | LESSEQUALS
                     | GREATEREQUALS
                     | NOTEQUALS'''
    token_to_operator = {
        'EQUALS': '=',
        'LESST': '<',
        'GREATERT': '>',
        'LESSEQUALS': '<=',
        'GREATEREQUALS': '>=',
        'NOTEQUALS': '!='
    }
    p[0] = token_to_operator[p.slice[1].type]

def p_condition_binary(p):
    '''condition : condition AND condition
                 | condition OR condition'''
    p[0] = ('binop', p[2].upper(), p[1], p[3])

def p_condition_comparison(p):
    'condition : IDENTIFIER comparison_op value'
    p[0] = ('cmp', p[1], p[2], p[3])

def p_field_list(p):
    '''field_list : IDENTIFIER
                  | IDENTIFIER COMMA field_list'''
    if len(p) == 2:
        p[0] = [p[1]]
    else:
        p[0] = [p[1]] + p[3]

def p_field_list_star(p):
    'field_list : STAR'
    p[0] = ['*']

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

def compare(left, op, right):
    if isinstance(left, str) and isinstance(right, (int, float)):
        try:
            left = float(left)
        except:
            return False
    if isinstance(right, str) and isinstance(left, (int, float)):
        try:
            right = float(right)
        except:
            return False
    if op == '=':
        return left == right
    elif op == '<':
        return left < right
    elif op == '>':
        return left > right
    elif op == '<=':
        return left <= right
    elif op == '>=':
        return left >= right
    elif op == '!=':
        return left != right
    else:
        raise ValueError(f"Unknown operator {op}")

def eval_condition(row, condition):
    if condition is None:
        return True
    if condition[0] == 'cmp':
        _, key, op, value = condition
        return compare(row.get(key), op, value)
    elif condition[0] == 'binop':
        _, operator, left, right = condition
        if operator == 'AND':
            return eval_condition(row, left) and eval_condition(row, right)
        elif operator == 'OR':
            return eval_condition(row, left) or eval_condition(row, right)
        else:
            raise ValueError(f"Unknown logical operator {operator}")

def get_sort_key(value):
    if isinstance(value, str):
        return value.lower()
    return value if value is not None else ''

def parse_query(query, data):
    ast = parser.parse(query)
    if ast[0] == 'select':
        _, fields, table, condition, order = ast
        result = []
        for row in data.get(table, []):
            if not eval_condition(row, condition):
                continue
            if fields == ['*']:
                result.append(row)
            else:
                result.append({f: row.get(f) for f in fields})
        if order:
            key, direction = order
            reverse = (direction.upper() == 'DESC')
            result.sort(
                key=lambda r: get_sort_key(r.get(key)),
                reverse=reverse
            )
        return result, False
    elif ast[0] == 'insert':
        _, table, obj = ast
        if table not in data:
            data[table] = []
        data[table].append(obj)
        return "OK", True
    elif ast[0] == 'update':
        _, table, assignments, condition = ast
        updated_count = 0
        for row in data.get(table, []):
            key, op, value = condition
            if compare(row.get(key), op, value):
                for col, val in assignments.items():
                    row[col] = val
                updated_count += 1
        return f"{updated_count} row(s) updated", True
    elif ast[0] == 'delete':
        _, table, condition = ast
        key, op, value = condition
        original = data.get(table, [])
        filtered = [row for row in original if not compare(row.get(key), op, value)]
        deleted_count = len(original) - len(filtered)
        data[table] = filtered
        return f"{deleted_count} row(s) deleted", True
    elif ast[0] == 'drop':
        _, table = ast
        if table in data:
            del data[table]
            return f"Table '{table}' dropped", True
        else:
            return f"Table '{table}' does not exist", False
    elif ast[0] == 'create':
        _, table = ast
        if table in data:
            return f"Table '{table}' already exists", False
        data[table] = []
        return f"Table '{table}' created", True
    elif ast[0] == 'show_tables':
        return list(data.keys()), False
    else:
        raise ValueError("Unknown statement type")
