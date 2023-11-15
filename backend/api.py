from flask import Flask,request,jsonify
from flask_restful import Resource,Api,reqparse
import firebase_admin
from flask_cors import CORS
from firebase_admin import auth, firestore,credentials
import random
import hashlib

def create_random_game_id():
    game_id = ""
    for i in range(15):
        game_id += str(random.randint(0,9))
    return game_id


print(create_random_game_id())

cred = credentials.Certificate("serviceAccountKey.json")

firebase_app = firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)


parser = reqparse.RequestParser()

api = Api(app)

class HelloWorld(Resource):
    def get(self):
        return {'test':'Good Stuff!'}
    


class NewGame(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        token = json_data['idToken']
        try:
            decoded_token = auth.verify_id_token(token)
            email = decoded_token["uid"]
            uid_hash = hashlib.sha256(email.encode()).hexdigest()
            difficulty = json_data['difficulty']
            game_id = create_random_game_id()
            number_of_moves = 0
            turns = ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]
            data = {
                "type":"ai",
                "game_id":game_id,
                "number_of_moves":number_of_moves,
                "turns":turns,
                "over":False,
                "winner":"",
                "uid_hash":uid_hash,
                "difficulty":difficulty
            }
            db.collection("users").document(email).collection("games").document(game_id).set(data)

            return {"id":game_id},200
        except Exception as e:
            print(e)
            return {"error":"An error as occurred"},404
    

api.add_resource(HelloWorld,'/')
api.add_resource(NewGame,"/newaigame")

@app.after_request
def after_request(response):
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

if __name__ == '__main__':
    app.run(debug=True)