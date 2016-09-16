from flask import request, session, jsonify
from . import api
from ..spatio_helper import (process_polygons, process_intersections,
                             process_unions, hseg_to_coords)
import json


@api.route("/manage_region", methods=["POST"])
def manage_region():
    """
    Restrives a JSON object. This object holds an ID of the polygon, the paths
    of the polygon and the action to do with the polygon. If action is "add"
    then the polygon is converted to a region and added to the session. If
    the action is "delete" then the region is removed from the session.

    Returns:
        successful
    """
    data = json.loads(request.form.get("data"))
    if data.get("action") == "add":
        region = {
            "id": data.get("id"),
            "region": process_polygons(data.get("path")),
            "visible": True
        }
        if not session.get("regions"):
            session["regions"] = []
        session["regions"].append(region)
    elif data.get("action") == "visible":
        for region in session["regions"]:
            if region.get("id") == int(data.get("id")):
                region["visible"] = not region["visible"]
    else:
        session["regions"] = [region for region in session[
            "regions"] if region.get("id") != int(data.get("id"))]
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
    regions = [region for region in session["regions"] if region.get("visible")]
    if len(regions) > 1:
        intersection = process_intersections(regions)
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
