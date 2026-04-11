import os
import sqlite3
from flask import Flask, jsonify, request, send_from_directory, Response

DB_PATH = os.environ.get('DB_PATH', '/data/contacts.db')
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')

app = Flask(__name__, static_folder=STATIC_DIR)


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            nom       TEXT NOT NULL,
            prenom    TEXT NOT NULL,
            email     TEXT NOT NULL DEFAULT '',
            telephone TEXT NOT NULL DEFAULT ''
        )
    ''')
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# REST API
# ---------------------------------------------------------------------------

@app.route('/api/contacts', methods=['GET'])
def list_contacts():
    conn = get_db()
    rows = conn.execute('SELECT * FROM contacts ORDER BY nom, prenom').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/contacts', methods=['POST'])
def create_contact():
    data = request.get_json(force=True)
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO contacts (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)',
        (data.get('nom', ''), data.get('prenom', ''),
         data.get('email', ''), data.get('telephone', ''))
    )
    conn.commit()
    row = conn.execute('SELECT * FROM contacts WHERE id = ?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201


@app.route('/api/contacts/<int:cid>', methods=['PUT'])
def update_contact(cid):
    data = request.get_json(force=True)
    conn = get_db()
    conn.execute(
        'UPDATE contacts SET nom=?, prenom=?, email=?, telephone=? WHERE id=?',
        (data.get('nom', ''), data.get('prenom', ''),
         data.get('email', ''), data.get('telephone', ''), cid)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM contacts WHERE id = ?', (cid,)).fetchone()
    conn.close()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict(row))


@app.route('/api/contacts/<int:cid>', methods=['DELETE'])
def delete_contact(cid):
    conn = get_db()
    conn.execute('DELETE FROM contacts WHERE id = ?', (cid,))
    conn.commit()
    conn.close()
    return '', 204


# ---------------------------------------------------------------------------
# RDF/OWL export  (vCard W3C ontology)
# ---------------------------------------------------------------------------

def _xml_escape(text):
    if not text:
        return ''
    return (text
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;'))


def build_rdf(contacts):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rdf:RDF',
        '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"',
        '  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"',
        '  xmlns:owl="http://www.w3.org/2002/07/owl#"',
        '  xmlns:vcard="http://www.w3.org/2006/vcard/ns#">',
        '',
        '  <owl:Ontology rdf:about="http://card-classic/contacts">',
        '    <rdfs:label>card-classic contacts export</rdfs:label>',
        '  </owl:Ontology>',
        '',
    ]
    for c in contacts:
        uri = f'http://card-classic/contacts/{c["id"]}'
        fn = f'{_xml_escape(c["prenom"])} {_xml_escape(c["nom"])}'.strip()
        lines += [
            f'  <vcard:Individual rdf:about="{uri}">',
            f'    <vcard:fn>{fn}</vcard:fn>',
            f'    <vcard:family-name>{_xml_escape(c["nom"])}</vcard:family-name>',
            f'    <vcard:given-name>{_xml_escape(c["prenom"])}</vcard:given-name>',
        ]
        if c.get('email'):
            lines += [
                '    <vcard:hasEmail>',
                '      <vcard:Email>',
                f'        <vcard:value rdf:resource="mailto:{_xml_escape(c["email"])}"/>',
                '      </vcard:Email>',
                '    </vcard:hasEmail>',
            ]
        if c.get('telephone'):
            lines += [
                '    <vcard:hasTelephone>',
                '      <vcard:Tel>',
                f'        <vcard:value rdf:resource="tel:{_xml_escape(c["telephone"])}"/>',
                '      </vcard:Tel>',
                '    </vcard:hasTelephone>',
            ]
        lines += ['  </vcard:Individual>', '']
    lines.append('</rdf:RDF>')
    return '\n'.join(lines)


@app.route('/api/export/rdf')
def export_rdf():
    conn = get_db()
    rows = conn.execute('SELECT * FROM contacts ORDER BY nom, prenom').fetchall()
    conn.close()
    xml = build_rdf([dict(r) for r in rows])
    return Response(
        xml,
        mimetype='application/rdf+xml',
        headers={'Content-Disposition': 'attachment; filename="contacts.rdf"'}
    )


# ---------------------------------------------------------------------------
# Serve React SPA
# ---------------------------------------------------------------------------

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=3000, debug=False)
