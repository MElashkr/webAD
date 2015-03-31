function WeightedUndirectedMatrix(_number){
	//number=of nodes
	this.number=_number;
	this.matrix=new Array(_number);
	for(var i=0;i<_number;i++){
		this.matrix[i]=new Array(_number);
	}
	this.scale=1;
}

WeightedUndirectedMatrix.prototype.initStage=function(cont){
	this.stage = new Kinetic.Stage({
  		container: cont,
  		draggable: true,
		width: 0,
		height: 0
	}); 
}

WeightedUndirectedMatrix.prototype.zoomIn=function(){
	if(this.scale<1.5)this.scale=this.scale+0.1;
	this.draw();
}

WeightedUndirectedMatrix.prototype.zoomOut=function(){
	if(this.scale>0.5)this.scale=this.scale-0.1;
	this.draw();
}

WeightedUndirectedMatrix.prototype.draw=function(){
	//var rects=;
	var dim=(75+this.number*50)*this.scale;
	this.stage.setHeight(dim);
	this.stage.setWidth(dim);
	this.stage.removeChildren();

  	var layer = new Kinetic.Layer();
  	
	var rects=new Array(this.number);
	for(var i=0;i<this.number;i++){
		rects[i]=new Array(this.number);
	}
	var numH=undefined, numV=undefined;
  	for(var i=0;i<this.number;i++){
  		
  		numH = new Kinetic.Text({
			x: (50+50*i)*this.scale,
			y: 0,
			text: i,
			fontSize: 25*this.scale,
			fontFamily: 'Calibri',
			fill: 'black',
		});
  		
  		numV = new Kinetic.Text({
			x: 0,
			y: (50+50*i)*this.scale,
			text: i,
			fontSize: 25*this.scale,
			fontFamily: 'Calibri',
			fill: 'black',
		});
  		
  		numHparallel = new Kinetic.Text({
  			x: (50+50*i)*this.scale,
			y: 25*this.scale+50*this.number*this.scale,
			text: i,
			fontSize: 25*this.scale,
			fontFamily: 'Calibri',
			fill: 'black',
		});
  		
  		numVparallel = new Kinetic.Text({
			x: 40*this.scale+50*this.number*this.scale,
			y: (50+50*i)*this.scale,
			text: i,
			fontSize: 25*this.scale,
			fontFamily: 'Calibri',
			fill: 'black',
		});
  		
  		var lineV = new Kinetic.Line({
			points: [numH.getX()-25*this.scale+10*this.scale,0,numH.getX()-25*this.scale+10*this.scale,dim],
			stroke: 'black',
			strokeWidth: 2*this.scale,
		});
  		
  		var lineH = new Kinetic.Line({
			points: [0,numV.getY()-25*this.scale,dim,numV.getY()-25*this.scale],
			stroke: 'black',
			strokeWidth: 2*this.scale,
		});
  		
  		//vertical
  		for(var j=0;j<this.number;j++){
  			var strokeCol="black";
  			var fill="white";
  			if(j==i)fill="red";
  			var rect = new Kinetic.Rect({
  				x: (35+50*j)*this.scale,
  				y: numV.getY()-25*this.scale,
  				width: 50*this.scale,
  				height: 50*this.scale,
  				fill: fill,
  				stroke: strokeCol,
  				strokeWidth: 2*this.scale
  			});
  			
  			rect.ij=""+(i)+":"+(j);
  			var um=this;
  			rect.on('click', function() {		  				
  		        var indexes=this.ij.split(":");
  		        if(um.matrix[indexes[0]][indexes[1]]==undefined && indexes[0]!=indexes[1]){
  		        	var weight=parseInt(prompt("Weight:\n>=-999, <=999"));
  	  				if(isNaN(weight) || weight<-999 ||weight>999)return;
  		        	um.matrix[indexes[0]][indexes[1]]=weight;
  		        	um.matrix[indexes[1]][indexes[0]]=weight;
  		        }

  		        um.draw();
  		        return;
  		    });
  			
  			rect.on('touchend', function() {
  				var indexes=this.ij.split(":");
  		        if(um.matrix[indexes[0]][indexes[1]]==undefined && indexes[0]!=indexes[1]){
  		        	var weight=parseInt(prompt("Weight:\n>=-999, <=999"));
  	  				if(isNaN(weight) || weight<-999 ||weight>999)return;
  		        	um.matrix[indexes[0]][indexes[1]]=weight;
  		        	um.matrix[indexes[1]][indexes[0]]=weight;
  		        }

  		        um.draw();
  		        return;
  		    });
  			
  			rects[i][j]=rect;
  			layer.add(rect);
  		}
  		
  		layer.add(numH);
	  	layer.add(numV);
	  	layer.add(numHparallel);
	  	layer.add(numVparallel);
	  	layer.add(lineH);
		layer.add(lineV);
  	}

  	
  	for(var i=0;i<this.number;i++){
  		for(var j=0;j<this.number;j++){
  			if(this.matrix[i][j]!=undefined){
  	  			var set = new Kinetic.Rect({
  	  				x: rects[i][j].getX(),
  	  				y: rects[i][j].getY(),
  	  				width: 50*this.scale,
  	  				height: 50*this.scale,
  	  				fill: 'lime',
  	  				stroke: 'black',
  	  				strokeWidth: 2*this.scale
  	  			});
  	  			
	  	  		weight = new Kinetic.Text({
					x: set.getX(),
					y: set.getY()+set.getHeight()/4,
					text: this.matrix[i][j],
					fontSize: 25*this.scale,
					fontFamily: 'Calibri',
					fill: 'black',
					width: set.getWidth(),
					align:'center'
				});
  	  			
  	  			set.ij=""+i+":"+j;
  	  			weight.ij=""+i+":"+j;
  	  			
  	  			var um=this;
	  	  		set.on('click', function() {
	  	  			var indexes=this.ij.split(":");	
	  		        um.matrix[indexes[0]][indexes[1]]=undefined;
	  		        um.matrix[indexes[1]][indexes[0]]=undefined;
	  		        //window.alert(um.matrix[indexes[0]][indexes[1]]);
	  		        um.draw();
	  		        return;
	  		    });
	  	  		
		  	  	set.on('touchend', function() {
	  	  			var indexes=this.ij.split(":");	
	  		        um.matrix[indexes[0]][indexes[1]]=undefined;
	  		        um.matrix[indexes[1]][indexes[0]]=undefined;
	  		        //window.alert(um.matrix[indexes[0]][indexes[1]]);
	  		        um.draw();
	  		        return;
	  		    });
	  	  		
		  	  	weight.on('click', function() {
	  	  			var indexes=this.ij.split(":");	
	  		        um.matrix[indexes[0]][indexes[1]]=undefined;
	  		        um.matrix[indexes[1]][indexes[0]]=undefined;
	  		        //window.alert(um.matrix[indexes[0]][indexes[1]]);
	  		        um.draw();
	  		        return;
	  		    });
		  	  	
		  	  	weight.on('touchend', function() {
	  	  			var indexes=this.ij.split(":");	
	  		        um.matrix[indexes[0]][indexes[1]]=undefined;
	  		        um.matrix[indexes[1]][indexes[0]]=undefined;
	  		        //window.alert(um.matrix[indexes[0]][indexes[1]]);
	  		        um.draw();
	  		        return;
	  		    });
  	  			
  				layer.add(set);
  				layer.add(weight);
  			}
  		}
  	}

  	var lineV = new Kinetic.Line({
		points: [numH.getX()+25*this.scale+10*this.scale,0,numH.getX()+25*this.scale+10*this.scale,dim],
		stroke: 'black',
		strokeWidth: 2*this.scale,
	});
		
		var lineH = new Kinetic.Line({
		points: [0,numV.getY()+25*this.scale,dim,numV.getY()+25*this.scale],
		stroke: 'black',
		strokeWidth: 2*this.scale,
	});
		
	layer.add(lineH);
	layer.add(lineV);

	this.stage.add(layer);	  
}