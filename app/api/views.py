from flask import request
from . import api
from ..utils import create_segments
import re


@api.route("/process_coords", methods=["POST"])
def process_coords():
    coordsArray =[]
    temp =[]
    formatOutput = []
    data = request.form.get('coords')
    splitData = re.split(r'[,()]', data)
    for x in range(len(splitData)):
        if splitData[x] != "":
            temp.append(float(splitData[x]))
        if x % 2 == 0:
            coordsArray.append(tuple(temp))
            temp =[]

    coordsArray = removeFromList(coordsArray)

    for x in range(1,len(coordsArray)):
        temp.append(coordsArray[x - 1])
        temp.append(coordsArray[x])
        if len(temp) == 2:
            formatOutput.append(tuple(temp))
            temp = []

    print create_segments(formatOutput)
    return "You sent me this stuff:\n{}".format(formatOutput)

def removeFromList(someList):
    for x in range(len(someList)-1):
        if x % 2 == 0:
            someList.remove(())
    return someList