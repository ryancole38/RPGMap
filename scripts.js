class GameBoard {
    constructor(canvas){
        
        this.tiles = { 0: 
            { 
                0: {
                    x: 0,
                    y: 0,
                    color: "green",
                    lines: [0, 1]
                }
            }
        };

        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.xCenter = canvas.getBoundingClientRect().width / 2;
        this.yCenter = canvas.getBoundingClientRect().height / 2;

        this.showUnsetTiles = false;

        this.xOffset = 0;
        this.yOffset = 0;

        this.size = 20;
        this.boardUpdateTaskID = -1;
        this.isDragging = false;

        this.mouseDragStartX;
        this.mouseDragStartY;

        this.currentMouseX;
        this.currentMouseY;

        this.millisecondsPerFrame = 1000/60;
        
        this.addTile = this.addTile.bind(this);
        this.getTile = this.getTile.bind(this);
        this.onWheelScroll = this.onWheelScroll.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseDragStart = this.onMouseDragStart.bind(this);
        this.onMouseDragEnd = this.onMouseDragEnd.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.updateBoard = this.updateBoard.bind(this);
        this.findIndexOf = this.findIndexOf.bind(this);
        this.registerTileSelectedCallback = this.registerTileSelectedCallback.bind(this);

        this.canvas.addEventListener('wheel', this.onWheelScroll);

        this.canvas.addEventListener('mousedown', this.onMouseDragStart);

        this.canvas.addEventListener('mouseup', this.onMouseDragEnd);

        this.canvas.addEventListener('mousemove', this.onMouseMove);

        this.tileSelectedCallbacks = [];

        this.drawBoard();

    }

    addTile(tile){
        if(!(tile.x in this.tiles)){
            this.tiles[tile.x] = {};
        } 

        this.tiles[tile.x][tile.y] = tile;
        this.drawBoard();
    }

    getTile(coords){
        if(!(coords.x in this.tiles) || !(coords.y in this.tiles[coords.x])){
            return {x: coords.x, y: coords.y, color: null, lines: []};
        }

        return this.tiles[coords.x][coords.y];
    }

    findIndexOf(xCoord, yCoord){

        let hypotenuse = Math.sqrt(Math.pow(this.size, 2) + Math.pow(0.5*this.size, 2));

        let x = xCoord - this.xCenter - this.xOffset;
        let y = yCoord - this.yCenter - this.yOffset + this.size;

        x = x / (hypotenuse * 2 - (hypotenuse - (0.5 * this.size)));
        x = Math.round(x);
        if(x % 2 == 0) y -= this.size;
        y = y / (this.size * 2);
        y = Math.round(y);

        return {"x": x, "y": y};
    }

    drawBoard(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let topLeft = this.findIndexOf(0, 0);
        let bottomRight = this.findIndexOf(this.canvas.width, this.canvas.height);

        for(let x = topLeft["x"] - 1; x < bottomRight["x"] + 1; x++){
            for(let y = topLeft["y"] - 1; y < bottomRight["y"] + 1; y++){
                let xRow = this.tiles[x];
                if(xRow != undefined){
                    let tile = xRow[y];
                    if(tile != undefined){
                        this.drawHexagon(x, y, tile.color, tile.lines);
                    } else if( this.showUnsetTiles){
                        this.drawHexagon(x, y);
                    }
                } else if(this.showUnsetTiles){
                    this.drawHexagon(x, y);
                }
            }
        }
    }

    updateBoard(){
        let deltaX = this.currentMouseX - this.mouseDragStartX;
        let deltaY = this.currentMouseY - this.mouseDragStartY;

        if(Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5){
            this.xOffset += deltaX;
            this.yOffset += deltaY;
            this.mouseDragStartX = this.currentMouseX;
            this.mouseDragStartY = this.currentMouseY;
            this.drawBoard();
        }
    }

    drawHexagon(x, y, color=null, lines=null){
        let hypotenuse = Math.sqrt(Math.pow(this.size, 2) + Math.pow(0.5*this.size, 2));

        y *= this.size * 2;
        if(x % 2 == 0) y += this.size;
        x = x * (hypotenuse * 2 - (hypotenuse - (0.5 * this.size)));
        x += this.xCenter + this.xOffset;
        y += this.yCenter + this.yOffset - this.size;
    
        this.context.beginPath();
        this.context.moveTo(x - (0.5 * this.size), y + this.size);
        this.context.lineTo(x + (0.5 * this.size), y + this.size);
        this.context.lineTo(x + hypotenuse, y);
        this.context.lineTo(x + (0.5 * this.size), y - this.size);
        this.context.lineTo(x - (0.5 * this.size), y - this.size);
        this.context.lineTo(x - hypotenuse, y);
        this.context.lineTo(x - (0.5 * this.size), y + this.size);
        if(color != null){
            this.context.fillStyle = color;
            this.context.fill();
        } 
        this.context.stroke();

        if(lines !== null){
            lines.forEach( line => {
                this.context.moveTo(x, y);
                if(line === 0){
                    this.context.lineTo(x, y - this.size);
                    this.context.stroke();
                } else if (line === 1){
                    this.context.lineTo(x + hypotenuse, y);
                    this.context.stroke();
                } else if (line === 2){
                    this.context.lineTo(x, y + this.size);
                    this.context.stroke();
                } else if (line === 3){
                    this.context.lineTo(x - hypotenuse, y);
                    this.context.stroke();
                }
            });
        }
    }

    onMouseDragStart(event){
        this.mouseDown = true;
        this.mouseDownTimeoutID = setTimeout( () => {
            if(this.mouseDown){
                this.isDragging = true;
                this.mouseDragStartX = event.clientX;
                this.mouseDragStartY = event.clientY;
                this.currentMouseX = event.clientX;
                this.currentMouseY = event.clientY;
                if(this.boardUpdateTaskID === -1){
                    this.boardUpdateTaskID = setInterval(this.updateBoard, this.millisecondsPerFrame);
                }
            }
        }, 250);
    }

    onMouseDragEnd(event){
        clearTimeout(this.mouseDownTimeoutID);
        if(!this.isDragging){
            this.onClick(event);        

        }
        this.mouseDown = false;
        this.isDragging = false;
        if(this.boardUpdateTaskID !== - 1){
            clearInterval(this.boardUpdateTaskID);
            this.boardUpdateTaskID = -1;
        }
    }

    onMouseMove(event){
        if(this.isDragging){
            this.currentMouseX = event.clientX;
            this.currentMouseY = event.clientY;
        }
    }

    onClick(event){
        let clickX = event.clientX - event.target.getBoundingClientRect().left;
        let clickY = event.clientY - event.target.getBoundingClientRect().top;            
        
        let coords = this.findIndexOf(clickX, clickY);
        this.tileSelectedCallbacks.forEach( func => {
            func(coords);
        });

        this.drawBoard();
    }

    onWheelScroll(event){
        event.preventDefault();
        if(this.size + event.deltaY * -0.01 < 100 && this.size + event.deltaY * -0.01 > 10){
            let scaleFactor = (this.size + (event.deltaY * -0.01)) / this.size;
            this.size += event.deltaY * -0.01;
            this.xOffset *= scaleFactor; //scale to center
            this.yOffset *= scaleFactor;
        }
        this.drawBoard();
    }

    registerTileSelectedCallback(func){
        this.tileSelectedCallbacks.push(func);
    }

    removeTileSelectedCallback(func){
        let index = this.tileSelectedCallbacks.indexOf(func);
        this.tileSelectedCallbacks.splice(index, 1);
    }

}

function addTile(coords){
    board.addTile({x: coords.x, y: coords.y, color: "green"});
}

function setTileHTML(coords){
    let tile = board.getTile(coords);
    document.getElementById('tile-coords').innerText = tile.x + ", " + tile.y;
    document.getElementById('tile-color').innerText = tile.color;
}

function changeGmMode(){
    let box = document.getElementById('gm-mode');
    if(box.checked === true){
        board.showUnsetTiles = true;
    } else {
        board.showUnsetTiles = false;
    }

    board.drawBoard();
}

let board;

window.addEventListener('load', () =>{
    board = new GameBoard(document.getElementById('screen'));

    board.registerTileSelectedCallback(addTile);
    board.registerTileSelectedCallback(setTileHTML);
});
