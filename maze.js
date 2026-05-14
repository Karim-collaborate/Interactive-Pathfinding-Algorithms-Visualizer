import { Heap } from "https://cdn.jsdelivr.net/npm/heap-js/+esm";
let clr, start_clicked=false, choose_clicked=false, width, height, neighbor;
let extremities = [];
//change the width value when the bar is changed
const widthRange = document.getElementById("width");
const width_val = document.getElementById("width_val");
widthRange.addEventListener("change",()=>{
    width_val.textContent = "width: " + widthRange.value;
});

//change the height value when the bar is changed
const heightRange = document.getElementById("height");
const height_val = document.getElementById("height_val");
heightRange.addEventListener("change",()=>{
    height_val.textContent = "height: " + heightRange.value;
});

//create the board 
const container = document.getElementsByClassName("container")[0];
const show_btn = document.getElementById("show");
show_btn.addEventListener("mouseenter", ()=>{
    if(start_clicked){
        show_btn.style.cursor = "not-allowed";
    }else{
        show_btn.style.cursor = "pointer";
    }
});
show_btn.addEventListener("click", ()=>{
    if(!start_clicked){
        choose_clicked = false;
        width = Number(document.getElementById("width").value);
        height = Number(document.getElementById("height").value);
        container.innerHTML= null;
        container.style.gridTemplateColumns = `repeat(${width},1fr)`;
        container.style.gridTemplateRows = `repeat(${height},1fr)`;
        for(let i=0; i<height; i++){
            for(let j=0; j<width; j++){
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.id = j + width*i;
                cell.style.border = "1px black solid";
                cell.style.backgroundColor = "white";
                
                cell.addEventListener("mouseenter",()=>{
                    cell.style.cursor= "pointer";
                    clr = cell.style.backgroundColor;
                    if(!choose_clicked && !start_clicked) cell.style.backgroundColor = "grey";
                    else if(!start_clicked) cell.style.backgroundColor = "orange";
                    else cell.style.cursor = "not-allowed";
                });

                cell.addEventListener("mouseleave",()=>{
                    cell.style.backgroundColor = clr;
                });

                cell.addEventListener("click",()=>{
                    if(!start_clicked && !choose_clicked){
                        if(clr === "white") clr = cell.style.backgroundColor = "black";
                        else clr = cell.style.backgroundColor = "white";
                    }else if(!start_clicked){
                        if(clr === "black"){
                            //toast obstacle can't be extremity
                            let text = "Obstacle can't be extremity";
                            let type = "obstacle";
                            let symbol = "fa-solid fa-circle-exclamation";
                            createToast(text, type, symbol);
                        }else if(clr === "red"){
                            clr = cell.style.backgroundColor = "white";
                            extremities = extremities.filter(elt => elt !== cell);
                        }else{
                            if(extremities.length === 2){
                                extremities[0].style.backgroundColor = "white";
                                extremities.shift();
                            }
                            clr = cell.style.backgroundColor = "red";
                            extremities.push(cell);
                        }
                    }
                });
                container.appendChild(cell);
            }
        }
    }
});


const choose = document.getElementById("choose");
choose.addEventListener("mouseenter", ()=>{
    if(start_clicked){
        choose.style.cursor = "not-allowed";
    }else{
        choose.style.cursor = "pointer";
    }
});

choose.addEventListener("click",()=>{
    if(container.childElementCount === 0){
        //toast create board first
        let text = "Create board first";
        let type = "board";
        let symbol = "fa-solid fa-circle-exclamation";
        createToast(text, type, symbol);
    }else if(!start_clicked){
        choose_clicked = true;
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            if(cell.style.backgroundColor !== "black") cell.style.backgroundColor = "white";
            if(cell.textContent !== "") cell.textContent = "";
        });
        if(extremities.length > 0) extremities[0].textContent = "" ;
        extremities = [];
    }
});

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

let success_trajectory = false;
const startDijkstra = document.getElementById("dijkstra");
startDijkstra.addEventListener("click", async ()=>{
    if(container.childElementCount === 0){ 
        // toast create board first 
        let text = "Create board first";
        let type = "board";
        let symbol = "fa-solid fa-circle-exclamation";
        createToast(text, type, symbol);
    }else if(extremities.length < 2){ 
        //toast choose 2 extremities
        let text = "Choose two extremities";
        let type = "extremities";
        let symbol = "fa-solid fa-circle-exclamation";
        createToast(text, type, symbol);
    }else if(start_clicked){
        //toast Algorithm is running
        let text = "Algorithm is running";
        let type = "running";
        let symbol = "fa-solid fa-circle-exclamation";
        createToast(text, type, symbol);
    }else{
        start_clicked = true;
        success_trajectory = false;
        //apply dijkstra 
        const pq = new Heap((a,b) => a[0] - b[0]);
        const distances = new Map();
        const pred = new Map();
        const cells = document.querySelectorAll(".cell");
        extremities[0].textContent = "";
        cells.forEach(cell => {
            distances.set(Number(cell.id),Infinity);
            pred.set(Number(cell.id), null);
            if(cell.style.backgroundColor === "blue" || cell.style.backgroundColor === "yellow") cell.style.backgroundColor = "white";
            
        });
        extremities[0].style.backgroundColor = "red";
        extremities[1].style.backgroundColor = "red";
        distances.set(Number(extremities[0].id), 0);
        pq.push([0, Number(extremities[0].id)]);

        while(pq.size()> 0){
            const animation_speed = document.getElementById("speed").value;
            const popped = pq.pop();
            const current_cell = document.getElementById(`${popped[1]}`);
            current_cell.style.backgroundColor = "blue";
            
            const row = Math.floor(popped[1]/width); 
            const col = popped[1] % width ;

            if(popped[1] === Number(extremities[1].id)){
                success_trajectory = true;
                break;
            }

            if (row-1 >= 0 ){
                neighbor = document.getElementById(`${col+(row-1)*width}`);
                if(neighbor && neighbor.style.backgroundColor !== "black" && popped[0]+1 < distances.get(col+(row-1)*width)){
                    pq.push([popped[0]+1,col+(row-1)*width]);
                    distances.set(col+(row-1)*width, popped[0]+1);
                    pred.set(col+(row-1)*width,popped[1]);
                } 
            } 

            if(col-1 >= 0){
                neighbor = document.getElementById(`${col-1 + row*width}`);
                if(neighbor && neighbor.style.backgroundColor !== "black" && popped[0]+1 < distances.get(col-1 + row*width)){
                    pq.push([popped[0]+1,col-1 + row*width]);
                    distances.set(col-1+row*width, popped[0]+1);
                    pred.set(col-1+row*width, popped[1]);
                } 
            }
            
            if(row+1 < height){
                neighbor = document.getElementById(`${col+(row+1)*width}`);
                if(neighbor && neighbor.style.backgroundColor !== "black" && popped[0]+1 < distances.get(col+(row+1)*width)){
                    pq.push([popped[0]+1,col+(row+1)*width]);
                    distances.set(col+(row+1)*width, popped[0]+1);
                    pred.set(col+(row+1)*width,popped[1]);
                } 
            }
            if(col+1 < width){
                neighbor = document.getElementById(`${col+1 + row*width}`);
                if(neighbor && neighbor.style.backgroundColor !== "black" && popped[0]+1 < distances.get(col+1+row*width)){
                    pq.push([popped[0]+1,col+1 + row*width]);
                    distances.set(col+1+row*width, popped[0]+1);
                    pred.set(col+1+row*width, popped[1]);
                } 
            }

            //delay 
            await sleep(100000/animation_speed);
        }
        
        if(success_trajectory){
            let current_id = Number(extremities[1].id);
            let current_cell , previous_id, path_length = 0;
            while (current_id !== Number(extremities[0].id)){
                current_cell = document.getElementById(`${current_id}`);
                current_cell.style.backgroundColor = "yellow";
                previous_id = current_id;
                current_id = pred.get(current_id);
                path_length++ ;
                //delay
                await sleep(150);
            }
            extremities[0].style.backgroundColor = "yellow";
            const r = Math.floor(current_id/width); 
            const c = current_id % width ;
            if(previous_id%width === c+1) extremities[0].textContent = "→";
            else if(previous_id%width === c-1) extremities[0].textContent = "←";
            else if(Math.floor(previous_id/width) === r-1) extremities[0].textContent = "↑";
            else extremities[0].textContent = "↓";
            
            //toast Length of path 
            let text = `The path length is:${path_length}`;
            let type = "pathlength";
            let symbol = "fa-solid fa-circle-check";
            createToast(text, type, symbol);
        }else{
            //toast There is no way between the two cells
            let text = "There is no way";
            let type = "noway";
            let symbol = "fa-solid fa-triangle-exclamation";
            createToast(text, type, symbol);
        }
        start_clicked = false;
        choose_clicked = false;
    }
});


const startBFS = document.getElementById("bfs");
startBFS.addEventListener("click", async () => {
    if (container.childElementCount === 0) {
        createToast("Create board first", "board", "fa-solid fa-circle-exclamation");
    } else if (extremities.length < 1) {
        createToast("Choose one extremity", "extremities", "fa-solid fa-circle-exclamation");
    } else if (start_clicked) {
        createToast("Algorithm is running", "running", "fa-solid fa-circle-exclamation");
    } else {
        start_clicked = true;
        success_trajectory = false;

        const queue = [];
        const visited = new Set();
        const pred = new Map();
        const cells = document.querySelectorAll(".cell");

        cells.forEach(cell => {
            pred.set(Number(cell.id), null);
            if (cell.style.backgroundColor === "blue" || cell.style.backgroundColor === "yellow")
                cell.style.backgroundColor = "white";
                if(cell.textContent !== "") cell.textContent = "" ;
        });

        extremities[0].style.backgroundColor = "red";

        const startId = Number(extremities[0].id);

        queue.push(startId);
        visited.add(startId);

        while (queue.length > 0) {
            const animation_speed = document.getElementById("speed").value;
            const current = queue.shift(); // FIFO
            const current_cell = document.getElementById(`${current}`);
            current_cell.style.backgroundColor = "blue";

            const row = Math.floor(current / width);
            const col = current % width;

            const neighbors = [];
            if (row - 1 >= 0)       neighbors.push(col + (row - 1) * width); // up
            if (col - 1 >= 0)       neighbors.push((col - 1) + row * width); // left
            if (row + 1 < height)   neighbors.push(col + (row + 1) * width); // down
            if (col + 1 < width)    neighbors.push((col + 1) + row * width); // right

            for (const neighborId of neighbors) {
                const neighborCell = document.getElementById(`${neighborId}`);
                if (neighborCell && neighborCell.style.backgroundColor !== "black" && !visited.has(neighborId)) {
                    visited.add(neighborId);
                    pred.set(neighborId, current);
                    queue.push(neighborId);
                }
            }

            await sleep(100000 / animation_speed);
        }
        start_clicked = false;
        choose_clicked = false;
    }
});


const startDFS = document.getElementById("dfs");
startDFS.addEventListener("click", async () => {
    if (container.childElementCount === 0) {
        createToast("Create board first", "board", "fa-solid fa-circle-exclamation");
    } else if (extremities.length < 1) {
        createToast("Choose one extremity", "extremities", "fa-solid fa-circle-exclamation");
    } else if (start_clicked) {
        createToast("Algorithm is running", "running", "fa-solid fa-circle-exclamation");
    } else {
        start_clicked = true;
        success_trajectory = false;

        const stack = [];
        const visited = new Set();
        const pred = new Map();
        const cells = document.querySelectorAll(".cell");

        cells.forEach(cell => {
            pred.set(Number(cell.id), null);
            if (cell.style.backgroundColor === "blue" || cell.style.backgroundColor === "yellow")
                cell.style.backgroundColor = "white";
                if(cell.textContent !== "") cell.textContent = "" ;
        });

        extremities[0].style.backgroundColor = "red";

        const startId = Number(extremities[0].id);

        stack.push(startId);

        while (stack.length > 0) {
            const animation_speed = document.getElementById("speed").value;
            const current = stack.pop(); // LIFO

            if (visited.has(current)) continue;
            visited.add(current);

            const current_cell = document.getElementById(`${current}`);
            current_cell.style.backgroundColor = "blue";

            const row = Math.floor(current / width);
            const col = current % width;

            const neighbors = [];
            if (row - 1 >= 0)       neighbors.push(col + (row - 1) * width); // up
            if (col - 1 >= 0)       neighbors.push((col - 1) + row * width); // left
            if (row + 1 < height)   neighbors.push(col + (row + 1) * width); // down
            if (col + 1 < width)    neighbors.push((col + 1) + row * width); // right

            for (const neighborId of neighbors) {
                const neighborCell = document.getElementById(`${neighborId}`);
                if (neighborCell && neighborCell.style.backgroundColor !== "black" && !visited.has(neighborId)) {
                    pred.set(neighborId, current);
                    stack.push(neighborId);
                }
            }

            await sleep(100000 / animation_speed);
        }
        start_clicked = false;
        choose_clicked = false;
    }
});

let notifications = document.getElementsByClassName("notifications")[0];
function createToast(text, type, symbol){
    const newToast = document.createElement("div");
    newToast.innerHTML = `<div class="toast ${type}">
            <i class="${symbol}"></i>
            <div class="content">${text}</div>
            <i class="fa-solid fa-xmark"></i>
        </div>`;
    notifications.appendChild(newToast);
    setTimeout(()=>newToast.remove(), 5000);
    const exit = newToast.lastChild;
    exit.addEventListener("click",()=>{
        newToast.remove();
    });
}
