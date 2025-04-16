# Notes on the frontend

The app is a state machine, and any appstate is a combination and ordering of `messages`, Redux/[Redux-toolkit](https://redux.js.org/introduction/why-rtk-is-redux-today) is used to manage this state change.

> **Model** Redux stores the model and handles state changes via `messages`, express needs it's own model as well.
>
> **View** React is the view for the app, using the "reduced" state from redux.
>
> **Controler** The express backend acts as controller, issuing state change messages (update game ticks, player joins room, game end, etc..), some actions can also be initiated client side, (join room, move piece, etc..).

# TODO

- make homepage `/` where there is a setup screen for creating a room, with button to navigate to created room page.
- make `/room/player` page to display an open room. Have two states, waiting for server to make room (socket message), and an opened room.

## Redux

The [redux docs](https://redux.js.org/tutorials/fundamentals/part-1-overview#data-flow) show a good example of how the state machine works via messages.
