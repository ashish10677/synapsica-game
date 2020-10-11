# A simple HTML and js game.

Credit: https://www.w3schools.com/graphics/game_intro.asp

## Task

1. Add keyboard events for up, down, left and right arrow keys.
2. Add user login and logout. Upon login, the user should be able to see their highest score so far.
3. Track the games played by the user and their scores. [Not local or session storage; at db level]
4. Allow only 10 attempts per user per day.

Notes -

* Do not use social or third party auth
* MongoDB or a comparable no-sql db should be used

## Running the application

``` git clone https://github.com/ashish10677/synapsica-game.git```

### Running the server

``` 
cd server
npm i
nodemon index.js
```

### Running the application

``` 
cd game-exercise
npm i
http-server .
```

Now go to http://localhost:8080 and the game is ready to play.
