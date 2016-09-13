from flask import request, session
from . import api
from ..spatio_helper import process_polygons, process_intersections, process_unions
import json


@api.route("/create_regions", methods=["POST"])
def create_regions():
    """
    Retrieves a list of JSON strings. These strings are converted back into a
    JSON object (dictionary). Returns result of create_region()

    Returns:
        This returns a post request of create_region().
    """
    data = json.loads(request.form.get("coords"))
    session["regions"] = []
    for polygon_id, polygon in data.items():
        session["regions"].append(
            {"id": polygon_id, "region": process_polygons(polygon)})
    return "{}".format(len(session["regions"])), 200


@api.route("/find_intersections", methods=["POST"])
def find_intersections():
    """
    The user has started the process intersections. The helper function is
    called to go through each region and see what other regions it intersects
    with.

    Returns:
        The hseg list of the intersections.
    """
    session["intersections"] = []
    session["intersections"] = process_intersections(session["regions"])
    return "", 200


@api.route("/find_unions", methods=["POST"])
def find_unions():
    """
    The user has started the process unions. The helper function is
    called to go through each region and see what other regions it unions
    with.

    Returns:
        The hseg list of the unions.
    """
    session["unions"] = []
    session["unions"] = process_unions(session["regions"])
    return "", 200
