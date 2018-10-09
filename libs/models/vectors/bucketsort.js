function Vector(){
    this.view = new VectorView(this);
    this.db = [];
    this.actStateID = -1;
}
Vector.prototype.init = function(){
    this.elements = [];
    this.buckets = [];
    this.i = 0;
    this.j = 0;
    
    this.speed = 10;
    this.paused = true;
    this.finished = false;
    
    if(this.actStateID != -1) this.saveInDB();
}
//----------
//----- DB-Functions -----
//----------
Vector.prototype.saveInDB = function(){
    var count = this.db.length - 1;
    
    if(count != this.actStateID){
        this.db.splice((this.actStateID + 1), (count - this.actStateID));
    }
    var last_state = this.db[this.db.length - 1];
    var new_state = this.copy();
    
    if(last_state == undefined || last_state.i != new_state.i || last_state.j != new_state.j || last_state.speed != new_state.speed) {
        this.db.push(new_state);
        this.actStateID = this.db.length - 1;
    }
}
Vector.prototype.copy = function() {
    var newVector = new Vector();
    
    newVector.elements = this.elements.slice();
    newVector.buckets = [];
    
    for(var i = 0; i < this.buckets.length; i++){
        newVector.buckets[i] = this.buckets[i].slice();
    }
    newVector.i = this.i;
    newVector.j = this.j;
    
    newVector.speed = this.speed;
    newVector.paused = true;
    newVector.finished = this.finished;
    
    return newVector;
}
Vector.prototype.replaceThis = function(toCopy){
    this.elements = toCopy.elements.slice();
    this.buckets = [];
    
    for(var i = 0; i < toCopy.buckets.length; i++){
        this.buckets[i] = toCopy.buckets[i].slice();
    }
    this.i = toCopy.i;
    this.j = toCopy.j;
    
    this.speed = toCopy.speed;
    this.paused = true;
    this.finished = toCopy.finished;
}
//----------
//----- Tape Recorder Functions -----
//----------
Vector.prototype.prev = function(){
    if(this.paused){
        if(this.actStateID > 0){
            var prev_id = this.actStateID - 1;
            
            this.actStateID = prev_id;
            this.replaceThis(this.db[prev_id]);
            this.draw();
        }
    } else window.alert("Pause the sorting first!");
}
Vector.prototype.next = function(){
    if(this.paused){
        if(this.actStateID < this.db.length - 1){
            var next_id = this.actStateID + 1;
            
            this.actStateID = next_id;
            this.replaceThis(this.db[next_id]);
            this.draw();
        }
    } else window.alert("Pause the sorting first!");
}
Vector.prototype.firstState = function(){
    if(this.paused){
        this.actStateID = 0;
        this.replaceThis(this.db[0]);
        this.draw();
    } else window.alert("Pause the sorting first!");
}
Vector.prototype.lastState = function(){
    if(this.paused){
        var last_id = this.db.length - 1;
        
        this.actStateID = last_id;
        this.replaceThis(this.db[last_id]);
        this.draw();
    } else window.alert("Pause the sorting first!");
}

//----- Value Functions -----

Vector.prototype.getElementsByPrompt = function(){
    var promptMessage = "Please enter the elements (separated by space):\nValues > 99 are ignored"; 
    var mode = "add";
    var valueInString = validInput(mode, promptMessage, null);
    
    if (valueInString === null){
        return;
    }
    
    if(valueInString) {
        this.init();
        
        var tempValsStr = valueInString.split(" ");

        for(var i = 0; i < tempValsStr.length; i++){
            var tempValue = parseInt(tempValsStr[i]);
            
            if(!isNaN(tempValue) && tempValue < 100){
                this.elements.push(tempValue);
                this.buckets.push([]);
            }
        }
        this.bucketsort();
        return true;
    }
    return false;
}

function validInput(mode, promptMessage, valueInString){
		var dataToValid;
		if (mode === "edit"){
            dataToValid = prompt(promptMessage, valueInString);
        }else if("add"){
            dataToValid = prompt(promptMessage);
        }
        
        data = dataToValid;
			do{
				var isNewvalNotValid = false;
				if (dataToValid === null)
					return null;
					
				if (/\s/.test(dataToValid)) {
   					 var dataArray = dataToValid.split(' ');
						for (var i = 0; i<dataArray.length; i++){
							if (isNaN(dataArray[i])){
								alert("Value ("+ dataArray[i]+ ") not allowed. Please enter a number");
								isNewvalNotValid = true;
								break;
							}else if (dataArray[i] > 99){
								alert("Value not allowed. Please enter a number less than 99");
								isNewvalNotValid = true;
								break;
							}
						}
				}else {
					dataToValid = parseInt(dataToValid);
					
					
					if (isNaN(dataToValid))
					{
						alert("Value not allowed. Please enter a number");
						isNewvalNotValid = true;
					}else if (dataToValid > 99){
						alert("Value not allowed. Please enter a number less than 99");
						isNewvalNotValid = true;
					}
				}
				
				if (isNewvalNotValid){
					if (mode === "edit"){
                        dataToValid = prompt(promptMessage, valueInString);
                    }else if("add"){
                        dataToValid = prompt(promptMessage);
                    } 
					data = dataToValid;
				}
					
				
			}while(isNewvalNotValid);
			
			return data;
}

Vector.prototype.setRandomElements = function(){
    this.init();
    
    for(var i = 0; i < 10; i++) {
        this.elements.push(Math.floor((Math.random() * 99) + 1));
        this.buckets.push([]);
    }
    this.bucketsort();
}
Vector.prototype.editElements = function(){
    var valueInString = "";
    
    this.elements.forEach(function(value) {
       valueInString += value + " ";
    });
    valueInString = valueInString.substring(0, (valueInString.length - 1));
    var promptMessage = "Add new values or delete/edit existing ones\nValues > 99 are ignored";
    var mode = "edit";
    var newValueInString = validInput(mode, promptMessage, valueInString);
    
    if (newValueInString === null){
        return;
    }
    
    if(newValueInString && !(newValueInString == valueInString)) {
        this.init();
        
        var tempValsStr = newValueInString.split(" ");

        for(var i = 0; i < tempValsStr.length; i++){
            var tempValue = parseInt(tempValsStr[i]);
            
            if(!isNaN(tempValue) && tempValue < 100){
                this.elements.push(tempValue);
                this.buckets.push([]);
            }
        }
        this.bucketsort();
    }
}
Vector.prototype.example = function(){
    this.init();
    
    this.elements = [90, 41, 80, 39, 69, 1, 19, 4, 48, 23];
    
    for(var i = 0; i < this.elements.length; i++){
        this.buckets.push([]);
    }
    this.saveInDB();
    this.draw();
}
//----------
//----- Algorithm -----
//----------
Vector.prototype.bucketsort = function(){
    var vector = this;
    
    function step(){
        if(vector.i < vector.elements.length){
            var value = vector.elements[vector.i];
            
            vector.buckets[Math.floor(vector.elements.length * (value / 100))].push(value);
            
            vector.draw();
            
            vector.i++;
            
            vector.saveInDB();
            
            if(vector.speed === 0){
                clearTimes();
            }else
            setTimeout(step, 100 * vector.speed);
            
        } else if(vector.j < vector.buckets.length){
            vector.buckets[vector.j].sort();
            
            vector.draw();
            
            vector.j++;
            
            vector.saveInDB();
            if(vector.speed === 0){
                clearTimes();
            }else
            setTimeout(step, 100 * vector.speed);
            
        } else {
            var sortedElements = []
            
            vector.buckets.forEach(function(bucket){
               bucket.forEach(function(value){
                  sortedElements.push(value);
               });
            });
            vector.elements = sortedElements.slice();
            
            vector.finished = true;
            
            vector.saveInDB();
            vector.draw();
            clearTimes();
        }
    }
    step();
}
Vector.prototype.draw = function(){
    this.view.draw();
}
Vector.prototype.size = function(){
    return (this.elements.length + this.buckets.length);
}