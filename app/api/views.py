from flask import request, session
from . import api
from ..spatio_helper import create_segments
import json


@api.route("/process_coords", methods=["POST"])
def process_coords():
    """
    Retrieves a JSON as as stirng. this string is converted back into a JSON
    object (dictionary). Returns result of create_segments()

    Returns: This returns a post request of create_segments().
    """
    data = json.loads(request.form.get("coords"))
    session["polygons"] = []
    session["regions"] = []
    for polygon in data:
        segment = polygon.get("b")
        session.get("polygons").append(segment)
        session.get("regions").append(create_segments(segment))
    return "{}".format(session.get("regions"))
