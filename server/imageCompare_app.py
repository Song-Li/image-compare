from flask import Flask, request,make_response, current_app
import os
import md5
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

mysql = MySQL()
app = Flask(__name__)
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
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


@app.route('/pictures', methods=['POST'])
def pictures():
    result = request.values['dataurl']
    flag = request.values['flag']
    result = re.sub('^data:image/.+;base64,','',result)
    image_data = result.decode('base64')
    image_data = cStringIO.StringIO(image_data)
    image_PIL = Image.open(image_data)
    image_PIL.save(pictures_path + str(flag)+ ".png")
    similarity = 4.0
    if flag == '2': 
        im1 = Image.open(pictures_path + '1.png')
        im2 = Image.open(pictures_path + '2.png')
        diff1 = ImageChops.subtract(im1,im2,0.01,0)
        diff2 = ImageChops.subtract(im2,im1,0.01,0)
        diff = ImageChops.add(diff1,diff2)
        #image_PIL = Image.open(diff)
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
    return flask.jsonify({"value": similarity})

