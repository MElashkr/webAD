function resizeCanvasAsync(datenstrukture) {
    setTimeout(function () {
        var can = document.getElementsByTagName('canvas');
        if (can != null) {
            if (can[0] != null) {
                if(datenstrukture =='dictionary'){
                    can[0].style.height = '500px'; 
                }else{
                    can[0].style.height = '435px';    
                }
            }
        }

        var kc = document.getElementsByClassName('kineticjs-content');
        if (kc != null) {
            if (kc[0] != null) {
                if(datenstrukture =='dictionary'){
                    kc[0].style.height = '500px'; 
                }else {
                    kc[0].style.height = '435px';    
                }
                
            }
        }
    }, 1);

};
