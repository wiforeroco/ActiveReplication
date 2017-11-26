function clickUnShift() {
       var div1 = document.getElementById('parameterUnshift');
       var div2 = document.getElementById('parameterPush');
       var div3 = document.getElementById('parameterIndexOf');
    
       if(div1.style.display == 'none'){
           div1.style.display = 'block';
           div2.style.display = 'none';
           div3.style.display = 'none';  
       }
}

function clickPush() {
       var div1 = document.getElementById('parameterUnshift');
       var div2 = document.getElementById('parameterPush');
       var div3 = document.getElementById('parameterIndexOf');
    
       if(div2.style.display == 'none'){
           div1.style.display = 'none';
           div2.style.display = 'block';
           div3.style.display = 'none';  
       }
}

function clickIndexOf() {
       var div1 = document.getElementById('parameterUnshift');
       var div2 = document.getElementById('parameterPush');
       var div3 = document.getElementById('parameterIndexOf');
    
       if(div3.style.display == 'none'){
           div1.style.display = 'none';
           div2.style.display = 'none';
           div3.style.display = 'block';  
       }
}