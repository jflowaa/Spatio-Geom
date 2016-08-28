from flask import request
from . import api
from .. import utils


@api.route("/process_coords", methods=["POST"])
def process_coords():
    data = request.form
    return "You sent me this stuff:\n{}".format(data)
