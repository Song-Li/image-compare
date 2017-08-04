from flask import Flask, request,make_response, current_app
import os
import md5
import urllib2
from flask_failsafe import failsafe
import flask
from flask_cors import CORS, cross_origin
import json
import hashlib
from flaskext.mysql import MySQL
import ConfigParser
import re
import numpy as np
from PIL import Image
from PIL import ImageChops
import base64
import cStringIO
from itertools import izip

root = "/home/sol315/server/imageCompare/"
pictures_path = "/home/sol315/server/imageCompare/pictures/"
config = ConfigParser.ConfigParser()
config.read(root + 'password.ignore')

mysql = MySQL()
app = Flask(__name__)
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
app.config['MYSQL_DATABASE_PASSWORD'] = config.get('mysql', 'password')
app.config['MYSQL_DATABASE_USER'] = config.get('mysql', 'username')
app.config['MYSQL_DATABASE_DB'] = 'imageCompare' 
mysql.init_app(app)
CORS(app)
base64_header = "data:image/png;base64,"

def run_sql(sql_str):
    db = mysql.get_db()
    cursor = db.cursor()
    cursor.execute(sql_str)
    db.commit()
    res = cursor.fetchall() 
    return res


def delete_all():
    sql_str = "delete from records"
    run_sql(sql_str)
    sql_str = "ALTER TABLE records AUTO_INCREMENT = 1"
    run_sql(sql_str)
    os.system("rm " + pictures_path + "*")

@app.route('/modifyjs', methods=['POST'])
def modifyjs():
    file_url = request.values['url']
    ori_file_name = '.' + file_url.split('.')[-1]
    if ori_file_name[-1] == '/':
        ori_file_name = ".html"
    response = urllib2.urlopen(file_url)
    js = response.read()
    js = "//injected\n\r" + js 
    file_name = md5.new(js).hexdigest() + ori_file_name
    f = open(pictures_path + 'htmls/' + file_name, 'w')
    f.write(js)
    return "http://lab.songli.io/compare/htmls/" + file_name


@app.route('/utils', methods=['POST'])
def utils():
    command = request.values['key']
    if command == 'get_list':
        sql_str = 'SELECT DISTINCT ip, time, id, agent, label from records'
        res = run_sql(sql_str)
        return "!@#$".join([r[0] + '~' + r[1].isoformat() + '~' + r[3] + '~' + str(r[2]) + '~' + str(r[4]) for r in res])
    if command.split(',')[0] == 'delete_all':
        if command.split(',')[1] == 'seclab':
            delete_all()
            return "finished"
        else:
            return "Wrong password"

@app.route('/pictures', methods=['POST'])
def pictures():
    result = request.values['dataurl']
    flag = request.values['flag']
    agent = request.headers.get('User-Agent')
    IP = request.remote_addr

    sql_str = 'INSERT INTO records (ip, agent) VALUES ("' + IP + '","' + agent + '")'
    run_sql(sql_str)
    # get the laster id as the picture id
    sql_str = 'SELECT LAST_INSERT_ID()'
    pic_id = run_sql(sql_str)[0][0]

    result = re.sub('^data:image/.+;base64,','',result)
    image_data = result.decode('base64')
    image_data = cStringIO.StringIO(image_data)
    image_PIL = Image.open(image_data)
    image_PIL.save(pictures_path + str(pic_id)+ ".png")
    return "finished"

def subtract(id1, id2):
    im1 = Image.open(pictures_path + id1 + '.png')
    im2 = Image.open(pictures_path + id2 + '2.png')
    diff1 = ImageChops.subtract(im1,im2,0.01,0)
    diff2 = ImageChops.subtract(im2,im1,0.01,0)
    diff = ImageChops.add(diff1,diff2)
    diff = diff.convert('RGB')
    diff.save(pictures_path + "compare.png")
    pairs = izip(im1.getdata(), im2.getdata())
    if len(im1.getbands()) == 1:
        dif = sum(abs(p1-p2) for p1, p2 in pairs)
    else:
        dif = sum(abs(c1-c2) for p1, p2 in pairs for c1, c2 in zip(p1,p2))
    n = im1.size[0] * im1.size[1] * 3
    similarity = (dif/ 255.0 * 100)/n
    return flask.jsonify({"value":similarity,"im1": list(im1.getdata()),"im2": list(im2.getdata()),"dif": list(diff.getdata())})
