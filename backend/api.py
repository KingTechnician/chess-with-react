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
    

class GetSpecificGame(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        token = json_data['idToken']
        try:
            decoded_token = auth.verify_id_token(token)
            email = decoded_token["uid"]
            uid_hash = hashlib.sha256(email.encode()).hexdigest()
            game_id = json_data['game_id']
            game = db.collection("users").document(email).collection("games").document(game_id).get()
            game_data = game.to_dict()
            game_data["id"] = game.id
            return game_data,200
        except Exception as e:
            print(e)
            return {"error":"An error as occurred"},404
        
class StoreMove(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        token = json_data['idToken']
        try:
            decoded_token = auth.verify_id_token(token)
            email = decoded_token["uid"]
            uid_hash = hashlib.sha256(email.encode()).hexdigest()
            game_id = json_data['game_id']
            current_board = json_data['currentBoard']
            # Grab the game, add to the turns array, and update the number of moves
            # Use Firebase to update the turns field and the number_of_moves field
            get_current_game = db.collection("users").document(email).collection("games").document(game_id).get()
            current_game = get_current_game.to_dict()
            game_ref = db.collection("users").document(email).collection("games").document(game_id)
            game_ref.update({
                "turns": current_game["turns"] + [current_board],
                "number_of_moves": firestore.Increment(1)
            })
            return {"success":"Move stored"},200
        except Exception as e:
            print(e)
            return {"error":"An error as occurred"},404 

class ListGames(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        token = json_data['idToken']
        try:
            decoded_token = auth.verify_id_token(token)
            email = decoded_token["uid"]
            uid_hash = hashlib.sha256(email.encode()).hexdigest()
            games = db.collection("users").document(email).collection("games").where("uid_hash","==",uid_hash).get()
            games_list = []
            for game in games:
                game_data = game.to_dict()
                game_data["id"] = game.id
                games_list.append(game_data)
            return {"games":games_list},200
        except Exception as e:
            print(e)
            return {"error":"An error as occurred"},404


api.add_resource(HelloWorld,'/')
api.add_resource(NewGame,"/newaigame")
api.add_resource(ListGames,"/listgames")
api.add_resource(GetSpecificGame,"/specificgame")
api.add_resource(StoreMove,"/move")

@app.after_request
def after_request(response):
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

if __name__ == '__main__':
    app.run(debug=True)