import os
import logging

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "l328973nfLlkads**3254nsdflL@"
    GOOGLE_MAPS_KEY = "AIzaSyCKjQOP5auPyirNV_5AH_wOZeeUnlX7-l0"
    LOGGING_LOCATION = "log"
    LOGGING_LEVEL = logging.DEBUG

    @staticmethod
    def init_app(app):
        handler = logging.FileHandler(app.config["LOGGING_LOCATION"])
        handler.setLevel(app.config["LOGGING_LEVEL"])
        app.logger.addHandler(handler)


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


configs = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}
