# particle_battle
for fun?



-----------
# Run

`npm install http-server -g`

then

```http-server``` and goto ```http://localhost:8080```

*Please use Latest Chrome & expect extreme lags as this piece is designed to work in back-end.*


# Rules

Creatures in this world can sense stuff around in range of *1* pixel away. 

In each turn, all creatures choose to either `move`, `attack`, or `turn`. 

### Move
Move drives the creature 1 pixel forward, to its own heading direction. It will fail silently if there's something ahead, or hitting the border of map.

### Attack
Attack kills neighbor enemy at creature's heading direction. It will fail silently if nothing's ahead, or miss the target if it moved away in same round.

If two creatures attack each other in same round, they both die.

### Turn
Turns the creature `right` or `left` relative to its own heading, one turn per round. 


# Designing your own Creature

Your creature is powered by one, single function. Name it as you wish, and put it inside `player1.js` or `player2.js`


Your Function will be called multiple times within one game loop, with each of your living creature instance as param. 


```javascript
function badAss(p) { 
    //where p is one creature

    //
    // your kick ass logic
    //

    // and finally make decision for this creature
    return {
        turn: DIRECTIONS.RIGHT
    }
}
```


Your Function makes decision for your creature instance by returning an object containing one single instruction: either `move`, `attack` or `turn`.

-------
*Sample return val: turn left*
```javascript
return
{
    turn: DIRECTIONS.LEFT
}
```

*Sample return val: turn right*
```javascript
return 
{
    turn: DIRECTIONS.RIGHT
}
```

*Sample return val: move forward*
```javascript
return 
{
    move: true
}
```

*Sample return val: attack what's in front*
```javascript
return 
{
    attack: true
}
```


## To start the fight
Set your function as Player1 (or Player2) by:
```javascript
player1 = badAss;
```

and refresh the page to watch it happen.




# The Creature

Each creature (`p`) is represented as:

```javascript
{
    x: Number, 
    y: Number,
    heading: Number, //(DIRECTION 0~3: UP, RIGHT, DOWN, LEFT)
    vision: [ , , , 
              , , ,
              , , , ], 
            
            // near-by objects in absolute coordinates. (len = 9)
    /*  
     *  p, p, p
     *  p,  , p
     *  p, p, p
     * where p could be undefined if no object's presence.
     */
    
    //nearby objects, relative to current heading
    front: p,
    behind: p,
    left: p,
    right: p,
    type: Number, //0 or 1, check if one creature belongs to another player by p.type != p2.type
    bag: {} //custom storage, put what ever you want in here - lasts throughout creatures' life cycle.
}
```

# Global Variables

``` javascript

w : int //width of the arena
h : int //height of the arena

```

# Have fun!