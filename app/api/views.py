from flask import request, session
from . import api
from ..spatio_helper import create_region, find_intersection
import json


@api.route("/process_polygons", methods=["POST"])
def process_polygons():
    """
    Retrieves a list of JSON strings. These strings are converted back into a
    JSON object (dictionary). Returns result of create_region()

    Returns: This returns a post request of create_region().
    """
    data = json.loads(request.form.get("coords"))
    polygonDict = {}
    session["regions"] = {}
    for polygon in data:
        polygonDict[polygon] = create_region(data[polygon])
    session["regions"] = polygonDict
    return "", 200


@api.route("/process_intersection", methods=["POST"])
def process_intersection():
    """

    Retrieves the intersections of the specified hsegs

    Returns: the hseg list of the intersections.
    """
    if 'intersection' not in session:
        session["intersection"] = {}
    hsegList = []
    hsegDic = session["regions"]
    data = json.loads(request.form.get("polygonIDs"))
    intersectionID = 0
    for polygonId in data:
        pId = int(polygonId)
        hsegList.append(hsegDic[polygonId])
        intersectionID += pId
    result = find_intersection(hsegList)
    session["intersection"].update({intersectionID: result})
    return "", 200
