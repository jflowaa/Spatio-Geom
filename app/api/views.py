from flask import request, session
from . import api
from ..spatio_helper import create_region
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
        segment = polygon.get("b")
        polygonDict[segment] = create_region(segment)
    session["regions"] = polygonDict
    return "", 200


@api.route("/process_intersection", methods=["POST"])
def process_intersection():
    """

    Retrieves the intersections of the specified hsegs

    Returns: the hseg list of the intersections.
    """
