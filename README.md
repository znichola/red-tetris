# red-tetris

## Stack
socket.io
JEST

### Backend
express

### Frontend
react
redux

## Types
Grid : a grid of Blocks
Block: int? representing different colors
Move: direction | rotation | vertical move (seed doc)
GameState : Grid & Specter of all players
RoomState : pending  | playing | ended
Specter : 1 D array of block height 


## Game Messages
DoMove : Move
UpdateGameState:   GameState

## Room messages
UpdateRoomState : RoomState

