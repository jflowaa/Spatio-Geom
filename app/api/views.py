from flask import request, session
from . import api
from ..spatio_helper import (process_polygons, process_intersections,
                             process_unions, hseg_to_coords)
import json


@api.route("/create_region", methods=["POST"])
def create_regions():
    """
    Retrieves a list of JSON strings. These strings are converted back into a
    JSON object (dictionary). Returns result of create_region()

    Returns:
        This returns a post request of create_region().
    """
    data = json.loads(request.form.get("polygon"))
    region = {
        "id": data.get("id"),
        "region": process_polygons(data.get("path"))
    }
    if not session.get("regions"):
        session["regions"] = []
    session["regions"].append(region)
    return "", 200


@api.route("/clear_session", methods=["POST"])
def clear_session():
    """
    Clears the session. We could restore the session but this could be
    computationally intensive when we're getting data from a database.

    Returns:
        successful
    """
    session.clear()
    return "", 200


@api.route("/find_intersections", methods=["POST"])
def find_intersections():
    """
    The user has started the process intersections. The helper function is
    called to go through each region and see what other regions it intersects
    with.

    Returns:
        The hseg list of the intersections.
    """
    intersection = process_intersections(session["regions"][0].get("region"),
                                         session["regions"][1:])
    return json.dumps(intersection)


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
