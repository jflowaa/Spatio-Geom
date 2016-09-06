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
    count = 1;
    for polygon in data:
    	key = "hseg" + str(count)
    	count = count + 1
    	segment = polygon.get("b")
    	session[key] = segment
    return "{}".format(session)
