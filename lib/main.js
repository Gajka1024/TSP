$(function() {
    var epoches = 200;
    var epochesCounter = 0;
    var pointSize = 5;
    var avgDistance;
    var handler ;
    var maxRoad = 8000;
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var width = canvas.width, height = canvas.height;

    var chromosomeArray = [], signifArray = [], pointsArray = [], fitnessArray = [], temporaryArray = [], binaryArray =[], lastChild = [];
    var num = 16, numOfChromosomes = 150;
    var newRoad;
    var newBinaryRoad;
    var color = '#e5e5e5';
    var startPoint;


    createRandomNodes(pointSize);
    generateChromosomes();


    /**
    * Generate new points.
    *
    */
    // var btnReset = document.getElementById("btnReset");
    // btnReset.addEventListener("click", function() {
    //     createRandomNodes(getNumOfPoints(), pointSize);
    // });

    /**
    * Change amount of points set on range bar.
    */
    // var rangeBar = document.getElementById("numOfPoints");
    // rangeBar.addEventListener("click", function() {
    //     num = getNumOfPoints();
    //     newRoad = new Array(parseInt(num));
    //     createRandomNodes(num, pointSize);
    // });

    /**
    * Get number if points set on range bar;
    *
    * @param  \Illuminate\Http\Request  $request
    * @return \Illuminate\Http\Response
    */
    function getNumOfPoints(){
        return document.getElementById('numOfPoints').value;  //ilość punktów
    }

    /**
    * Constructor of Point Object
    *
    */
    function Point(name, x, y, rate) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.rate = rate;
    }

    /**
    * Generate random points and save them in PointsArray.
    *
    * @param  \number of points\  $nr
    */
    function generatePoints(nr){
        for (var i = 1; i <nr; i++) {
            var rand_x = Math.random(i) * width;
            var rand_y = Math.random(i) * height;
            pointsArray.push(new Point(i, rand_x, rand_y, 1));
        }
        // console.log(JSON.stringify(pointsArray));
        drawPoints(pointsArray);
    }

    /**
    * Generate start point, which isn't save in chromosome
    *
    * @return start point
    */
    function chooseStartPoint(){
        var pkt;
        for (var i = 0; i <1; i++) {
            var rand_x = Math.random(i) * width;
            var rand_y = Math.random(i) * height;
            pkt = new Point(i, rand_x, rand_y, 1);
        }

        return pkt;
    }

    /**
    *  Draw points in canvas
    *
    * @param  \ array of points [(name, x, y, distance)]
    */
    function drawPoints(array){
        for (var i = 0; i < array.length; i++) {
            context.beginPath();
            context.arc(array[i].x, array[i].y, pointSize, 0, 2*Math.PI);
            context.fillStyle = "#000";
            context.fill();
            context.closePath();
        }
    }

    /**
    * Draw start point in canvas
    *
    * @param  \ Point Object (name, x, y, distance)
    */
    function drawStartPoint(point){
        context.beginPath();
        context.arc(point.x, point.y, pointSize, 0, 2*Math.PI);
        context.fillStyle = "#ff2626";
        context.fill();
        context.closePath();
    }

    /**
    * Create points, draw points wich path and show fist distance
    *
    * @param  \ size of point
    */
    function createRandomNodes(pointSize) {
        context.clearRect(0, 0, width, height);
        // generate points
        startPoint = chooseStartPoint();
        drawStartPoint(startPoint);
        generatePoints(num);
        // generate first path
        coordLines(num, pointsArray);
        // show first distance
        var distance = countDistance(pointsArray);
        document.getElementById("firstDistace").innerHTML = distance;
    }

    /**
    * Get co-ordinates of points
    *
    * @param  \ amount of points
    * @param  \ points array
    */
    function coordLines(num, array){
        for (var i = 0; i <num-2; i++){
            drawLines(array[i], array[i+1])
        }
        drawLines(startPoint, array[num-2]);
        drawLines(startPoint, array[0]);
    }

    /**
    * Draw line between points
    *
    * @param  \ start point
    * @param  \ end point
    */
    function drawLines(p1, p2){
        context.strokeStyle = color;
        context.beginPath();
        // Staring point (10,45)
        context.moveTo(p1.x, p1.y);
        // End point (180,47)
        context.lineTo(p2.x, p2.y);
        // Make the line visible
        context.stroke();
    }

    /**
    * Count distance of whole road
    *
    * @param  \ array of points
    * @return \ the sum of individual distances
    */
    function countDistance(array){
        var sum = 0;
        for (var i = 0; i <num-2; i++) {
            sum += distance(array[i], array[i+1])
        }
        sum += distance(startPoint, array[0]);
        sum += distance(startPoint, array[num-2]);
        return sum;
    }

    /**
    * Count distance between two points
    *
    */
    function distance(p1, p2) {
        return euclidean(p1.x-p2.x, p1.y-p2.y);
    }

    /**
    * Count euclidean sum
    *
    * @return \ return euclidean sum
    */
    function euclidean(dx, dy) {
        return Math.sqrt(dx*dx + dy*dy);
    }

    /**
    * Creating chromosomes by cloning the basic route and changing the order of cities visited.
    *
    */
    function generateChromosomes(){
        for (var i = 0; i < numOfChromosomes; i++) {
            var array = pointsArray.clone().shuffle();
            var distance = countDistance(array);
            array = encodeRoad(array);

            chromosomeArray.push({distance, array});
        }
        startEpoch();
    }

    /**
    * Saving the route as a table of successively visited cities
    *
    * @param  \point array wich coords
    * @return \array with name of of cities
    */
    function encodeRoad(array){
        var temp = [];
        for (var i = 0; i < array.length; i++) {
            temp.push(array[i].name);
        }
        return temp;
    }

    /**
    * Evaluate chromosomes based on distance.
    *
    * @return \ array of points with distance and new rate
    */
    function rateChromosomes(arr){
        avgDistance = 0;
        var rate, array, distance, temp = [];
        arr.sort(compareValues('distance', 'desc'));

        for (var i = (arr.length-1) ; i >= 0; i--) {
            // rate = (i+1)*3;
            distance = arr[i].distance;
            avgDistance += distance;
            rate = maxRoad - distance;
            if (rate < 0) {
                rate = 0;
            }
            array = arr[i].array;
            temp.push({array, distance, rate});
        }
        avgDistance = avgDistance/numOfChromosomes;
        return arr = temp;
    }

    /**
    * Start epoch
    *
    */
    function startEpoch(){
        handler = setInterval(interval, 70);
    }

    /**
    * Activities of one epoch
    *
    */
    function interval(){
        if (epochesCounter < epoches) {
            epochesCounter++;
            // console.log(JSON.stringify("________________START__________________"));
            // console.log(JSON.stringify(chromosomeArray));
            signifArray = [];
            fitnessArray = [];
            newRoad = new Array(num);
            chromosomeArray = rateChromosomes(chromosomeArray);

            binaryArray = decodeRoad();     //change to binary road

            newBinaryRoad = new Array(60);

            fitness(binaryArray);
            maxSignificant(signifArray);
            replaceTheWorstParent(newBinaryRoad);

            document.getElementById("epoches").innerHTML = epochesCounter;
            // document.getElementById("newDistace").innerHTML = chromosomeArray[chromosomeArray.length-1].distance;
            chromosomeArray = rateChromosomes(chromosomeArray);


            drawBestScore();
        }else{
            clearInterval(handler);
        }

    }

    /**
    * Clear canvas and draw new score;
    *
    */
    function drawBestScore(){
        context.clearRect(0, 0, width, height);
        drawStartPoint(startPoint);
        drawPoints(pointsArray);
        color = '#e5e5e5';

        coordLines(num, pointsArray);

        var bestScore = chromosomeArray[0].distance;
        var points = decodeCoords(chromosomeArray[0].array);

        document.getElementById("nextDistace").innerHTML = bestScore;
        // // context.clearRect(0, 0, canvas.width, canvas.height);
        color = '#ff0000';
        coordLines(num, points);
    }

    /**
    * Change decinal road to binary road where each gene will occupy 4 bits.
    *
    * @return \ array of binary road and distance
    */
    function decodeRoad(){
        var temp = [], binaryString ="", tempString = "", txt="", rate, array;

        for (var i = 0; i < chromosomeArray.length; i++) {
            binaryString =""
            for (var j = 0; j < num-1; j++) {
                tempString = dec2bin(chromosomeArray[i].array[j]);
                if (tempString.length == 1) {
                    txt = "000";
                    txt += tempString;
                }else if (tempString.length == 2) {
                    txt = "00";
                    txt += tempString;
                } else if (tempString.length == 3) {
                    txt = "0";
                    txt += tempString;
                }else{
                    txt = tempString;
                }
                binaryString += txt;
                rate = chromosomeArray[i].rate;
            }
            temp.push({binaryString,array,rate});
        }
        console.log(JSON.stringify(temp));
        return temp;

    }

    /**
    * Change decimal to binary number
    *
    */
    function dec2bin(dec){
        return (dec >>> 0).toString(2);
    }

    /**
    * Count finess of alleles and save them in fitness array
    *
    */
    function fitness(array){
        fitnessArray = [];
        var f0_amount, f1_amount, f0_val, f1_val, f0=0., f1=0 ;
        var end = 60;
        for (var j = 0; j <end; j++) {
            f0_amount = 0, f1_amount = 0, f0_val=0, f1_val=0;

            for (var i = 0; i < array.length; i++) {
                if ( array[i].binaryString[j] == "1") {
                    f1_val+=array[i].rate;
                    f1_amount++;
                } else {
                    f0_val+=array[i].rate;
                    f0_amount++;
                }
            }

            if (f0_amount == 0) {
                f0 = 0;
            } else{
                f0 = (f0_val/f0_amount);
            }
            if (f1_amount == 0) {
                f1 = 0;
            } else{
                f1 = (f1_val/f1_amount);
            }
            // console.log(JSON.stringify("f0_val = " + f0_val + " f0_amount = " + f0_amount));
            // console.log(JSON.stringify("f1_val = " + f1_val + " f1_amount = " + f1_amount));
            // console.log(JSON.stringify("f0 = " + f0 + " f1 = " + f1));
            fitnessArray.push({f0, f1});
        }
        estimateSignificant(fitnessArray);
    }

    /**
    * Count significant of the gene
    *
    */
    function estimateSignificant(array){
        var sg;
        signifArray = [];
        for (var i = 0; i < array.length; i++) {
            sg = array[i].f1 - array[i].f0;
            sg = Math.abs(sg);
            signifArray.push(sg);
        }
    }


    /**
    * Choose the greatest significant, choose the most important place and set value
    *
    * @param  \Illuminate\Http\Request  $request
    * @return \Illuminate\Http\Response
    */
    function maxSignificant(){
        var setGenes = [];
        temporaryArray = binaryArray.clone() ;
        while (newBinaryRoad.includes(undefined)) {
            for (var i = 0; i < setGenes.length; i++) {
                signifArray[setGenes[i]] = null;
            }
            var max = signifArray.max();
            var indexOfMax = signifArray.indexOf(max);
            setGenes.push(indexOfMax);
            newBinaryRoad[indexOfMax] = selectValueNewGene(indexOfMax);
            estimateEpistasis(indexOfMax, selectValueNewGene(indexOfMax));
            fitness(temporaryArray);
        }

    }

    /**
    * Estimate epistasis
    *
    */
    function estimateEpistasis(position, val){

        var p1, p0,f1,f0, temp = [];
        f0 = fitnessArray[position].f0;
        f1 = fitnessArray[position].f1;
        p1 = f1/(f1+f0);
        p0 = f0/(f1+f0);
        dMax = Math.abs(p1 - p0);
        e = 1-dMax;
        for (var i = 0; i < temporaryArray.length; i++) {
            if (temporaryArray[i].binaryString[position] != val) {
                if (Math.random() > e || temporaryArray.length > numOfChromosomes/10) {
                    temp.push(temporaryArray[i]);
                }
                changeChromosome(i);
            } else {
                temp.push(temporaryArray[i]);
            }
        }
        temporaryArray = temp;
    }

    function changeChromosome(nr){
        if (nr > 2) {
            var array = pointsArray.clone().shuffle();
            var distance = countDistance(array);
            // console.log(JSON.stringify(avgDistance));
            if (distance < avgDistance) {
                array = encodeRoad(array);

                chromosomeArray[nr] = ({distance, array});
            }
        }
    }


    /**
    * Select a value for the gene depence on the probability of the allele to be choosen for the gene.
    *
    */
    function selectValueNewGene(position){
        if (fitnessArray[position].f0 > fitnessArray[position].f1) {
            return 0;
        } else {
            return 1;
        }
    }


    /**
    * Replece the worst parent
    *
    * @param  \binary road
    */
    function replaceTheWorstParent(array){
        var temp = [];
        var lastEl = chromosomeArray.length - 1;
        var rate = 1;

        //change birnary road to decimal
        array = encodeBinaryRoad(array);

        if(lastChild.toString() != array.toString()){
            lastChild = array.clone();
            temp = array.clone();
        }else{
            temp = array.clone().shuffle();
        }
        temp = decodeCoords(temp);
        var distance = countDistance(temp);
        chromosomeArray[lastEl] = ({array, distance, rate});

    }

    /**
    * Change birnary road to decimal
    *
    */
    function encodeBinaryRoad(array){

        var temp = [], road = [], counter = 1, txt="";

        for (var i = 0; i < array.length; i++) {
            if (counter != 4) {
                txt+=array[i];
                counter++;
            } else {
                counter = 1;
                txt+=array[i];
                temp.push(txt);
                txt = "";
            }
        }
        for (var i = 0; i < temp.length; i++) {
            road.push(bin2dec(temp[i]));
        }
        return road = eliminateRepetition(road);
    }

    /**
    * Eliminate repetition of visited cities
    *
    */
    function eliminateRepetition(road){
        var oldChar, newChar, oldPos, newPos;
        var array = pointsArray.clone().shuffle();
        array = encodeRoad(array);

        for (var i = road.length-1; i >= 0; i--) {

            newChar = road[i];
            if (newChar!=0) {
                oldChar = array[i];
                for (var j = array.length-1; j >= 0; j--) {
                    if (newChar == array[j]) {
                        oldPos = j;
                    }
                }
                array[oldPos] = array[i];
                array[i] = road[i];
            }
            // console.log(JSON.stringify(road));
            // console.log(JSON.stringify(array));
        }
        return array;
    }

    /**
    * Change binary to decimal
    *
    */
    function bin2dec(binary){
        return parseInt(binary, 2);

    }

    /**
    * Find coords of points
    *
    */
    function decodeCoords(arr){
        var temp = arr.clone();
        for (var i = 0; i < temp.length; i++) {
            for (var j = 0; j < pointsArray.length; j++) {
                if(temp[i] == pointsArray[j].name){
                    var x = pointsArray[j].x,
                        y = pointsArray[j].y,
                        name = temp[i];
                    temp[i] = {name, x, y};
                }
            }
        }
        return temp;
    }

    /**
    * Sort values in array
    *
    */
    function compareValues(key, order = 'desc') {
      return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
          // property doesn't exist on either object
          return 0;
        }

        const varA = (typeof a[key] === 'string')
          ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
          ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
          comparison = 1;
        } else if (varA < varB) {
          comparison = -1;
        }
        return (
          (order === 'desc') ? (comparison * -1) : comparison
        );
      };
    }

    function compareArr(arr1,arr2){

        if(!arr1  || !arr2) return

        let result;

        arr1.forEach((e1,i)=>arr2.forEach(e2=>{

            if(e1.length > 1 && e2.length){
                result = compare(e1,e2);
            }else if(e1 !== e2 ){
                result = false
            }else{
                result = true
            }
        })
    )

    return result

}

});
