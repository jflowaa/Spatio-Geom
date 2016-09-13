from flask import request, session
from . import api
from ..spatio_helper import create_region, find_intersections
import json


@api.route("/process_polygons", methods=["POST"])
def process_polygons():
    """
    Retrieves a list of JSON strings. These strings are converted back into a
    JSON object (dictionary). Returns result of create_region()

    Returns:
        This returns a post request of create_region().
    """
    data = json.loads(request.form.get("coords"))
    session["regions"] = []
    for polygon_id, polygon in data.items():
        session["regions"].append({"id": polygon_id, "region": create_region(polygon)})
    return "{}".format(len(session["regions"])), 200


@api.route("/process_intersection", methods=["POST"])
def process_intersection():
    """
    The user has started the process intersections. The helper function is
    called to go through each region and see what other regions it intersects
    with.

    Returns:
        The hseg list of the intersections.
    """
    session["intersections"] = []
    session["intersections"] = find_intersections(session["regions"])
    return "", 200
