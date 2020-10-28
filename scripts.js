class GameBoard {
    constructor(canvas){
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.xCenter = canvas.getBoundingClientRect().width / 2;
        this.yCenter = canvas.getBoundingClientRect().height / 2;

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

        this.onWheelScroll = this.onWheelScroll.bind(this);
        this.onMouseDragStart = this.onMouseDragStart.bind(this);
        this.onMouseDragEnd = this.onMouseDragEnd.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.updateBoard = this.updateBoard.bind(this);

        this.canvas.addEventListener('wheel', this.onWheelScroll);

        this.canvas.addEventListener('mousedown', this.onMouseDragStart);

        this.canvas.addEventListener('mouseup', this.onMouseDragEnd);

        this.canvas.addEventListener('mousemove', this.onMouseMove);

        this.drawBoard();

    }

    drawBoard(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for(let i = -5; i < 15; i++){
            for(let j = -5; j < 10; j++){
                let fill = (i === 0 && j === 0)? true : false;
                this.drawHexagon(i, j, fill);
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

    drawHexagon(x, y, fill){
        let hypotenuse = Math.sqrt(Math.pow(this.size, 2) + Math.pow(0.5*this.size, 2));

        y *= this.size * 2;
        if(x % 2 == 0) y += this.size;
        x = x * hypotenuse * 2 - (x * (hypotenuse - (0.5 * this.size)));
    
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
        if(fill){
            this.context.fill();
        } else{
            this.context.stroke();
        }
    }

    onMouseDragStart(event){
        this.isDragging = true;
        this.mouseDragStartX = event.clientX;
        this.mouseDragStartY = event.clientY;
        this.currentMouseX = event.clientX;
        this.currentMouseY = event.clientY;
        if(this.boardUpdateTaskID === -1){
            this.boardUpdateTaskID = setInterval(this.updateBoard, this.millisecondsPerFrame);
        }
    }

    onMouseDragEnd(event){
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

    onWheelScroll(event){
        event.preventDefault();
        let scaleFactor = (this.size + (event.deltaY * -0.01)) / this.size;
        this.size += event.deltaY * -0.01;
        this.xOffset *= scaleFactor; //scale to center
        this.yOffset *= scaleFactor;
        this.drawBoard();
    }


}

window.addEventListener('load', () =>{
    let board = new GameBoard(document.getElementById('screen'));
});
