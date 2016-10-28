from flask import request, session, jsonify
from . import api
from ..spatio_helper import (process_polygons, process_intersections,
                             process_unions, process_difference,
                             process_interpolate_regions,
                             process_interval_region_at_time,
                             hseg_to_coords)
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
            "visible": True,
            "computation": data.get("computation"),
            "selected": False
        }
        if not session.get("regions"):
            session["regions"] = []
        session["regions"].append(region)
    elif data.get("action") == "visible":
        for region in session["regions"]:
            if region.get("id") == int(data.get("id")):
                region["visible"] = not region["visible"]
    elif data.get("action") == "select":
        for region in session["regions"]:
            if region.get("id") == int(data.get("id")):
                region["selected"] = not region["selected"]
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


@api.route("/restore_session", methods=["POST"])
def restore_session():
    """
    Called on load of page. This is used for restoring the map of polygons
    back to how it was when the user left the page or refreshed the page.

    Returns:
        Dictionary of two lists. One for the regions in lat and long. The
        other list for the ID of the region.
    """
    if session.get("regions"):
        regions_to_coords = {}
        regions_to_coords["polygons"] = []
        for region in session.get("regions"):
            coords_dict = {}
            hseg = hseg_to_coords(region["region"])
            coords_dict["coords"] = hseg
            coords_dict["id"] = region["id"]
            coords_dict["computation"] = region["computation"]
            coords_dict["visible"] = region["visible"]
            regions_to_coords["polygons"].append(coords_dict)
            if(region["selected"]):
                region["selected"] = not region["selected"]
        return jsonify({"success": True, "data": regions_to_coords})
    else:
        return jsonify({"success": False, "data": "No session found"})


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
    regions = [region for region in session[
        "regions"] if (region.get("selected") and region.get("visible"))]
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
    regions = [region for region in session[
        "regions"] if (region.get("selected") and region.get("visible"))]
    if len(regions) > 1:
        union = process_unions(regions)
    else:
        return jsonify(
            {"success": False, "data": "Not enough regions selected"})
    if union:
        return jsonify({"success": True, "data": hseg_to_coords(union)})
    else:
        return jsonify(
            {"success": False, "data": "No common union"})


@api.route("/find_difference", methods=["POST"])
def find_difference():
    """
    The user has started the process difference. The helper function is
    called to go through each region and see what other regions it has
    difference with

    Returns:
        The hseg list of the differences.
    """
    regions = [region for region in session[
        "regions"] if (region.get("selected") and region.get("visible"))]
    if len(regions) > 1:
        difference = process_difference(regions)
    else:
        return jsonify(
            {"success": False, "data": "Not enough regions selected"})
    if difference:
        return jsonify({"success": True,
                        "data": hseg_to_coords(difference, True)})
    else:
        return jsonify(
            {"success": False, "data": "No common difference"})


@api.route("/find_interoplated_regions", methods=["POST"])
def find_interoplated_regions():
    """
    The user has started the process interpolate. The user passes a start and
    finish time for the regions. The selected regions are then interpolated.
    Since the regions are now merged into region. The session is updated so
    that each region in the session has the paths. The new coordinates of the
    merged region are returned to the client.

    Returns:
        The hseg list of the differences.
    """
    data = json.loads(request.form.get("data"))
    start_time = data.get("startTime")
    end_time = data.get("endTime")
    regions = [region for region in session[
        "regions"] if (region.get("selected") and region.get("visible"))]
    if len(regions) == 2:
        introplated = process_interpolate_regions(
            regions, start_time, end_time)
    else:
        return jsonify(
            {"success": False, "data": "Not enough regions selected"})
    if introplated:
        interval_regions = {}
        # More than one interval tuple can be returned for different time
        # segments. To make make sure we can quickly get the correct tuple the
        # keys will be the max time that interval tuple has.
        for interval_tuple in introplated:
            if interval_tuple:
                max_time = 0
                min_time = None
                for line_tuple in interval_tuple:
                    for line in line_tuple:
                        if type(line) is tuple:
                            if line[2] > max_time:
                                max_time = line[2]
                            if min_time is None or line[2] < min_time:
                                min_time = line[2]
                interval_regions[int(max_time)] = {
                    "min_time": min_time,
                    "interval_tuple": interval_tuple
                }
                max_time = 0
                min_time = None
        regions[0]["interval_region"] = interval_regions
        regions[1]["interval_region"] = interval_regions
        seg1 = hseg_to_coords(regions[1]["region"])
        seg2 = hseg_to_coords(regions[0]["region"])
        # Since each hseg from session will have the same unique id we must
        # make the unique id ourselves.
        segments = {
            "2": seg1[2],
            "3": seg2[2]
        }
        # This will merge the polygons int one polygon and store it.
        paths = []
        paths.append(seg1[2])
        paths.append(seg2[2])
        regions[0]["region"] = process_polygons(paths)
        regions[1]["region"] = process_polygons(paths)
        regions[0]["computation"] = "Interpolated Regions"
        regions[1]["computation"] = "Interpolated Regions"
        return jsonify({"success": True, "data": segments})
    else:
        return jsonify(
            {"success": False, "data": "No common difference"})
    return jsonify({"success": True})


@api.route("/find_region_at_time", methods=["POST"])
def find_region_at_time():
    data = json.loads(request.form.get("data"))
    time = data.get("time")
    polygon_id = data.get("polygonID")
    region = [region for region in session[
        "regions"] if (region.get("id") == int(polygon_id))]
    interval_region = region[0]["interval_region"]
    valid_interval_region = None
    for max_time in interval_region:
        if (int(time) <= int(max_time) and
                int(time) >= int(interval_region[max_time]["min_time"])):
            valid_interval_region = interval_region[max_time]["interval_tuple"]
    found_region = process_interval_region_at_time(valid_interval_region, time)
    if found_region:
        return jsonify({"success": True, "data": found_region})
    else:
        return jsonify(
            {"success": False, "data": "No common coords"})
