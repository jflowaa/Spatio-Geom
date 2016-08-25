from flask import request
from . import api
from .. import utils


@api.route("/do_a_thing", methods=["POST"])
def do_a_thing():
    data = request.form
    return "You sent me this stuff:\n{}".format(data)
