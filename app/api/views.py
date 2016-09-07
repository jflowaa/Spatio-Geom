from flask import request, session
from . import api
from ..spatio_helper import create_region
import json


@api.route("/process_polygons", methods=["POST"])
def process_polygons():
    """
    Retrieves a list of JSON strings. These strings are converted back into a JSON
    object (dictionary). Returns result of create_region()

    Returns: This returns a post request of create_region().
    """
    data = json.loads(request.form.get("coords"))
    session["polygons"] = []
    session["regions"] = []
    for polygon in data:
        segment = polygon.get("b")
        session.get("polygons").append(segment)
        session.get("regions").append(create_region(segment))
    return "{}".format(session.get("regions"))
