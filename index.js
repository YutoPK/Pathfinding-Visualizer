// import $ from "jquery";

let cellWithStartPoint = -1, cellWithEndPoint = -1;
let listOFBlockCells = [];
let isRoadBuilding = false;

function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}
  
function drop(ev) {
    ev.preventDefault();
    if(!isRoadBuilding){
        let data = ev.dataTransfer.getData("text");
        if(ev.target.nodeName != 'IMG' && document.getElementById(data) != null){
            if(data == "startPoint")
                cellWithStartPoint = parseInt(ev.target.id);
            if(data == "endPoint")
                cellWithEndPoint = parseInt(ev.target.id);
            ev.target.appendChild(document.getElementById(data));    
        }
    }
}

function startDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}

let table = () => {
    let isBlockActive = false;
    let isEraserActive = false;
    let isMousePressedWithBlockActive = false;
    let isMousePressedWithEraserActive = false;
    let numberOfCollums = 0;
    let numberOfRows = 0;
    let whichAlgo = 1;
    let INF = 10000000;
    let directions = [{x:0, y:-1}, {x:-1, y:0}, {x:0, y:1}, {x:1, y:0}];
    let isRoadActive = false;
    let roads = []
    let standbys = []
    let globalDistance;

    function constructCords(numberOfCell){
        let x = Math.floor((numberOfCell - 1) / numberOfCollums);
        let y = (numberOfCell - 1) % numberOfCollums;
        return {x, y};
    }

    function deconstructCords(i, j){
        let ret = i * numberOfCollums + j + 1;
        return ret;
    }

    function resetGlobalPoints(){
        cellWithStartPoint = -1;
        cellWithEndPoint = -1;
        listOFBlockCells = []
    }

    function addNewBlockCellToArray(blockCell){
        listOFBlockCells.push(parseInt(blockCell));
    }

    function removeBlockCellFromArray(blockCell){
        const index = listOFBlockCells.indexOf(blockCell);
        listOFBlockCells.splice(index, 1);
    }

    function addNewBlock(obj){
        if(!isRoadBuilding){
            const newBlock = document.createElement("img");
            newBlock.src = "img\\block2.png"
            newBlock.class = "block"
            newBlock.draggable = false;
            if(obj.childElementCount == 0){
                obj.appendChild(newBlock)
                addNewBlockCellToArray(obj.id);
                if(isRoadActive)
                    removeRoads();
            }else if(obj.lastElementChild.class == "road"){
                let child = obj.lastElementChild;
                if(child != null){
                    obj.removeChild(child);
                    obj.appendChild(newBlock)
                    addNewBlockCellToArray(obj.id);
                    if(isRoadActive)
                        removeRoads();
                }
            }
        }
    }

    function addNewRoad(i, j){
        const newRoad = document.createElement("img");
        newRoad.src = "img\\road.png"        
        newRoad.draggable = false;
        newRoad.class = "road"
        let obj = document.getElementById(String(deconstructCords(i, j)));

        if(obj.childElementCount == 0){
            obj.appendChild(newRoad)
        }
    }

    function addNewStandBy(i, j){
        const newStandBy = document.createElement("img");
        newStandBy.src = "img\\standby.png"        
        newStandBy.draggable = false;
        newStandBy.class = "standby"
        let obj = document.getElementById(String(deconstructCords(i, j)));

        if(obj.childElementCount == 0){
            obj.appendChild(newStandBy)
        }
    }
    
    function removeBlock(obj){
        if(!isRoadBuilding){
            let child = obj.lastElementChild;
            if(child != null && child.class == "block"){
                obj.removeChild(child);
                removeBlockCellFromArray(parseInt(obj.id))
                if(isRoadActive)
                    removeRoads();
            }
        }
    }

    function removeRoads(){
        isRoadActive = false;
        for(let i = 0; i < roads.length; ++i){
            let obj = document.getElementById(String(roads[i]));
            let child = obj.lastElementChild;
            if(child != null && child.class == "road")
                obj.removeChild(child);
        }
        roads = [];
    }

    function removeStandBys(){
        for(let i = 0; i < standbys.length; ++i){
            let obj = document.getElementById(String(standbys[i]));
            let child = obj.lastElementChild;
            if(child != null && child.class == "standby")
                obj.removeChild(child);
        }
        standbys = []
    }

    function fill2DArray(array, value){
        for(let i = 0; i < numberOfRows; ++i){
            for(let j = 0; j < numberOfCollums; ++j){
                array[i][j] = value;
            }
        }
    }

    function fill2DArrayForBlocks(array){
        for(let i = 0; i < numberOfRows; ++i){
            for(let j = 0; j < numberOfCollums; ++j){
                array[i][j] = false;
            }
        }

        for(let i = 0; i < listOFBlockCells.length; ++i){
            let cords = constructCords(listOFBlockCells[i]);
            array[cords.x][cords.y] = true;
        }
    }

    function create2DArray(d1, d2) {
        var arr = new Array(d1), i, l;
        for(i = 0, l = d1; i < l; i++) {
            arr[i] = new Array(d2);
        }
        return arr;
    }

    function recursionForRoad(fi, fj, i, j, ei, ej, distance){
        if(fi == i && fj == j){
            isRoadBuilding = false;   
            return
        }
        if(i != ei || j != ej){
            addNewRoad(i, j);
            roads.push(deconstructCords(i, j))
        }

        setTimeout(() => {
            for(let ind = 0; ind < 4; ++ind){
                let newI = i + directions[ind].x, newJ = j + directions[ind].y;
                if(newI < 0 || newI >= numberOfRows || newJ < 0 || newJ >= numberOfCollums)
                    continue;
                if(distance[newI][newJ] + 1 == distance[i][j]){
                    recursionForRoad(fi, fj, newI, newJ, ei, ej, distance);
                    return;
                }                
            }
        }, 30);
    }

    function visualiseDijsktraAdded(){
        if(isRoadActive){
            removeRoads();
            let startPoint = constructCords(cellWithStartPoint)
            let endPoint = constructCords(cellWithEndPoint)

            if(globalDistance[endPoint.x][endPoint.y] == INF){
                alert("There are no paths");
                isRoadActive = false;
            }else{
                isRoadActive = true;
                isRoadBuilding = true;
                recursionForRoad(startPoint.x, startPoint.y, endPoint.x, endPoint.y, endPoint.x, endPoint.y, globalDistance);
            }
        }
    }

    function dijkstraSetupPart3(prioQueue, distance, isBlockHere, processed, startPoint, endPoint, isEndPointFound){
        let topCell = prioQueue.dequeue();
        if(processed[topCell.x][topCell.y])
            dijkstraSetupPart2(prioQueue, distance, isBlockHere, processed, startPoint, endPoint, isEndPointFound)
        processed[topCell.x][topCell.y] = true;
        addNewStandBy(topCell.x, topCell.y);
        standbys.push(deconstructCords(topCell.x, topCell.y))
        if(endPoint.x == topCell.x && endPoint.y == topCell.y)
            isEndPointFound = true;

        for(let i = 0; i < 4; ++i){
            let newCordX = topCell.x + directions[i].x, newCordY = topCell.y + directions[i].y;
            if(newCordX < 0 || newCordX >= numberOfRows || newCordY < 0 || newCordY >= numberOfCollums)
                continue;
            if(isBlockHere[newCordX][newCordY])
                continue;
            if(distance[topCell.x][topCell.y] + 1 < distance[newCordX][newCordY]){
                distance[newCordX][newCordY] = distance[topCell.x][topCell.y] + 1;
                prioQueue.queue({dist: -distance[newCordX][newCordY], x: newCordX,  y: newCordY});
            }
        }
        dijkstraSetupPart2(prioQueue, distance, isBlockHere, processed, startPoint, endPoint, isEndPointFound)
    }

    function dijkstraSetupPart2(prioQueue, distance, isBlockHere, processed, startPoint, endPoint, isEndPointFound){
        if(prioQueue.length == 0){
            globalDistance = distance;
            removeStandBys();

            if(distance[endPoint.x][endPoint.y] == INF){
                alert("There are no paths");
                isRoadActive = false;
            }else{
                isRoadActive = true;
                recursionForRoad(startPoint.x, startPoint.y, endPoint.x, endPoint.y, endPoint.x, endPoint.y, distance);
            }
        }else{
            if(!isEndPointFound){
                setTimeout(() => {
                    dijkstraSetupPart3(prioQueue, distance, isBlockHere, processed, startPoint, endPoint, isEndPointFound)
                }, 0);
            }else{
                dijkstraSetupPart3(prioQueue, distance, isBlockHere, processed, startPoint, endPoint, isEndPointFound)
            }
        }

    }

    function visualiseDijkstra(){
        removeRoads();
        let startPoint = constructCords(cellWithStartPoint)
        let endPoint = constructCords(cellWithEndPoint)

        let isBlockHere = create2DArray(numberOfRows, numberOfCollums);
        let distance = create2DArray(numberOfRows, numberOfCollums);
        let processed = create2DArray(numberOfRows, numberOfCollums);

        fill2DArray(processed, false);
        fill2DArray(distance, INF);
        fill2DArrayForBlocks(isBlockHere);

        distance[startPoint.x][startPoint.y] = 0;

        let prioQueue = new PriorityQueue({ comparator: function(a, b) { return b.dist - a.dist; }});
        
        prioQueue.queue({dist: 0, x: startPoint.x,  y: startPoint.y});

        isRoadBuilding = true;

        dijkstraSetupPart2(prioQueue, distance, isBlockHere, processed, startPoint, endPoint)

    }

    function BFSSetupPart3(startPoint, endPoint, isBlockHere, distance, queue, isEndPointFound){
        let topCell = queue.shift();
        addNewStandBy(topCell.x, topCell.y);
        standbys.push(deconstructCords(topCell.x, topCell.y))
        if(endPoint.x == topCell.x && endPoint.y == topCell.y)
            isEndPointFound = true;

        for(let i = 0; i < 4; ++i){
            let newCordX = topCell.x + directions[i].x, newCordY = topCell.y + directions[i].y;
            if(newCordX < 0 || newCordX >= numberOfRows || newCordY < 0 || newCordY >= numberOfCollums)
                continue;
            if(isBlockHere[newCordX][newCordY])
                continue;

            if(distance[newCordX][newCordY] == INF){
                distance[newCordX][newCordY] = distance[topCell.x][topCell.y] + 1;
                queue.push({x: newCordX,  y: newCordY});
            }
        }

        BFSSetupPart2(startPoint, endPoint, isBlockHere, distance, queue, isEndPointFound);

    }

    function BFSSetupPart2(startPoint, endPoint, isBlockHere, distance, queue, isEndPointFound){
        if(queue.length == 0){
            globalDistance = distance;
            removeStandBys();

            if(distance[endPoint.x][endPoint.y] == INF){
                alert("There are no paths");
                isRoadActive = false;
            }else{
                isRoadActive = true;
                recursionForRoad(startPoint.x, startPoint.y, endPoint.x, endPoint.y, endPoint.x, endPoint.y, distance);
            }
        }else{
            if(!isEndPointFound){
                setTimeout(() => {
                    BFSSetupPart3(startPoint, endPoint, isBlockHere, distance, queue, isEndPointFound)
                }, 0);
            }else{
                BFSSetupPart3(startPoint, endPoint, isBlockHere, distance, queue, isEndPointFound)
            }
        }

    }

    function visualiseBFS(){
        removeRoads();
        let startPoint = constructCords(cellWithStartPoint)
        let endPoint = constructCords(cellWithEndPoint)

        let isBlockHere = create2DArray(numberOfRows, numberOfCollums);
        let distance = create2DArray(numberOfRows, numberOfCollums);

        fill2DArray(distance, INF);
        fill2DArrayForBlocks(isBlockHere);

        distance[startPoint.x][startPoint.y] = 0;

        let queue = [];

        queue.push({x: startPoint.x,  y: startPoint.y});

        isRoadBuilding = true;

        BFSSetupPart2(startPoint, endPoint, isBlockHere, distance, queue)
    }

    function setupOnClickForEachCell(table_id){

        document.getElementById("table-id").onmousedown = function() { 
            if(isBlockActive)
                isMousePressedWithBlockActive = true;
            if(isEraserActive)
                isMousePressedWithEraserActive = true;
        }

        document.body.onmouseup = function() {
            if(isBlockActive)
                isMousePressedWithBlockActive = false;
            if(isEraserActive)
                isMousePressedWithEraserActive = false;
        }

        let TABLE = document.getElementById(table_id);
        if (TABLE != null) {
            for (let i = 0; i < TABLE.rows.length; i++) {
                for (let j = 0; j < TABLE.rows[i].cells.length; j++){
                    TABLE.rows[i].cells[j].ondrop = function(ev){
                        isMousePressedWithBlockActive = false;
                        isMousePressedWithEraserActive = false;
                        if(ev.target != null && ev.target.firstChild != null){
                            if(whichAlgo == 1){
                                if(ev.target.firstChild.id == "endPoint")
                                    visualiseDijsktraAdded();
                                else if(isRoadActive)
                                    visualiseDijkstra();
                            }else{
                                if(ev.target.firstChild.id == "endPoint")
                                    visualiseDijsktraAdded();
                                else if(isRoadActive)
                                    visualiseBFS();
                            }
                        }
                    }
                    TABLE.rows[i].cells[j].firstChild.onmousedown = function () { 
                        if(isBlockActive)
                            addNewBlock(this);
                        if(isEraserActive)
                            removeBlock(this); 
                    };

                    TABLE.rows[i].cells[j].firstChild.onmouseover = function () { 
                        if(isBlockActive && isMousePressedWithBlockActive)
                            addNewBlock(this); 
                        if(isEraserActive && isMousePressedWithEraserActive)
                            removeBlock(this); 
                    };
                }
            }
        }
    }

    function resetStartAndEndPoint(){
        let divForStartPoint = document.getElementById("start-point-div");
        let divForEndPoint = document.getElementById("end-point-div");
        let existingStartPoint = document.getElementById("startPoint");
        let existingEndPoint = document.getElementById("endPoint");
        divForStartPoint.appendChild(existingStartPoint);
        divForEndPoint.appendChild(existingEndPoint);
    }

    function activateBlock(){
        $('#block-div').css("border", "3px solid #898373");
        isBlockActive = true;
    }

    function deactivateBlock(){
        if(isBlockActive){
            $('#block-div').css("border", "3px solid #0157AE");
            isBlockActive = false;
            isMousePressedWithBlockActive = false;
        }
    }

    function activateEraser(){
        $('#eraser-div').css("border", "3px solid #898373");
        isEraserActive = true;
    }

    function deactivateEraser(){
        if(isEraserActive){
            $('#eraser-div').css("border", "3px solid #0157AE");
            isEraserActive = false;
            isMousePressedWithEraserActive = false;
        }
    }

    function recreateWholeTable(table_id){
        resetStartAndEndPoint();
        deactivateBlock();
        deactivateEraser();
        resetGlobalPoints();
        removeRoads();

        TABLE = $(table_id);
        TABLE_HTML = "<table>"
    
        let sizeOfCell = 42, addedBorder = 15;
        let num_cols = Math.floor(($(window).width() - addedBorder) / sizeOfCell);
        let num_rows = 18;

        numberOfCollums = num_cols;
        numberOfRows = num_rows


        let EMPTY_CELL_DIV_STRING_PART_1 = "<div ";
        let EMPTY_CELL_DIV_STRING_PART_2 =  " class=\"table-cell-div\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\">"

        let cnt = 0;
        for (let i = 0; i < num_rows; i++){
            TABLE_HTML += "<tr>";
            for (let j = 0; j < num_cols; j++){
                cnt++;
                TABLE_HTML += "<td class=\"table-cell\">";
                TABLE_HTML += EMPTY_CELL_DIV_STRING_PART_1;
                TABLE_HTML += "id=\"" + String(cnt) + "\"";
                TABLE_HTML += EMPTY_CELL_DIV_STRING_PART_2;
                TABLE_HTML += "</div>";
                TABLE_HTML += "</td>"
            }
            TABLE_HTML += "</tr>"
        }
        TABLE_HTML += "</table>"
        TABLE.html(TABLE_HTML);

        setupOnClickForEachCell("table-id")
    }

    $('#eraser-div').click(function(evt){  
        if(!isEraserActive){
            activateEraser();
            deactivateBlock()
        }else{
            deactivateEraser();
        }
    });

    $('#block-div').click(function(evt){  
        if(!isBlockActive){
            activateBlock();
            deactivateEraser();
        }else{
            deactivateBlock();
        }
    });

    window.onclick = function(event) {
        if (!event.target.matches('.dropdown-start-button')) {
            let dropdowns = document.getElementsByClassName("dropdown-content-div");
            for(let i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    } 
    
    $('#refresh-table-button').click(function(evt){
        if(!isRoadBuilding)
            $(function(){recreateWholeTable("#table-id")});
    })

    $('#algorithm-1').click(function(evt){
        whichAlgo = 1;
    })

    $('#algorithm-2').click(function(evt){
        whichAlgo = 2;
    })

    $('#visualize-table-button').click(function(evt){
        if(!isRoadBuilding){
            if(cellWithStartPoint != -1 && cellWithEndPoint != -1){
                if(whichAlgo == 1)
                    visualiseDijkstra();
                else if(whichAlgo == 2)
                    visualiseBFS();
            }
            else
                alert("Place start and end point")
        }
    })

    $('#devisualize-table-button').click(function(evt){
        if(!isRoadBuilding)
            removeRoads();
    })

    $(window).on("resize", function(){
        if(!isRoadBuilding)
            $(function(){recreateWholeTable("#table-id")});
    });

    var ignoreClickOnMeElement1 = document.getElementById('table-id');
    var ignoreClickOnMeElement2 = document.getElementById('block-div');
    var ignoreClickOnMeElement3 = document.getElementById('eraser-div');
    var ignoreClickOnMeElement4 = document.getElementsByClassName('block');
    

    document.addEventListener('mousedown', function(event) {
        var isClickInsideTable1 = ignoreClickOnMeElement1.contains(event.target);
        var isClickInsideTable2 = ignoreClickOnMeElement2.contains(event.target);
        var isClickInsideTable3 = ignoreClickOnMeElement3.contains(event.target);
        var isClickInsideTable4 = ignoreClickOnMeElement4.contains(event.target);
        if (!isClickInsideTable1 && !isClickInsideTable2 && !isClickInsideTable3 && !isClickInsideTable4) {
            deactivateBlock();
            deactivateEraser();
        }
    });
    
    $(function(){recreateWholeTable("#table-id")});
}


let TABLE = table();