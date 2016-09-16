from flask import request, session, jsonify
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
        successful
    """
    data = json.loads(request.form.get("polygon"))
    region = {
        "id": data.get("id"),
        "region": process_polygons(data.get("path"))
    }
    if not session.get("regions"):
        session["regions"] = []
    session["regions"].append(region)
    return jsonify({"success": True})


@api.route("/clear_session", methods=["POST"])
def clear_session():
    """
    Clears the session. We could restore the session but this could be
    computationally intensive when we're getting data from a database.

    Returns:
        successful
    """
    session.clear()
    return jsonify({"success": True})


@api.route("/find_intersections", methods=["POST"])
def find_intersections():
    """
    The user has started the process intersections. The helper function is
    called to go through each region and see what other regions it intersects
    with. This will only try to find intersections if there are more than 1
    regions stored on the session. If there's a common intersection found then
    that intersection will be returned and mapped.

    Returns:
        A polygon to map. This polygon is the intersection.
    """
    # TODO: Need to allow the user to select regions for intersection checking
    if len(session.get("regions")) > 1:
        intersection = process_intersections(session["regions"])
    else:
        return jsonify(
            {"success": False, "data": "Not enough regions selected"})
    if intersection:
        return jsonify({"success": True, "data": hseg_to_coords(intersection)})
    else:
        return jsonify(
            {"success": False, "data": "No common intersection"})


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
    return jsonify({"success": True})
