from flask import Flask
from flask_restful import Resource,Api
import firebase_admin
firebase_app = firebase_admin.initialize_app()

app = Flask(__name__)

api = Api(app)

class HelloWorld(Resource):
    def get(self):
        return {'test':'Good Stuff!'}
    

api.add_resource(HelloWorld,'/')

if __name__ == '__main__':
    app.run(debug=True)