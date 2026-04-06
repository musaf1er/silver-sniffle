let trex = document.getElementById("trex");
let kaktus = document.getElementById("kaktus");

document.addEventListener("keydown", function(event){
    if(event.code === "Space"){
        lompat();
    }
});

function lompat(){
    if(!trex.classList.contains("lompat")){
        trex.classList.add("lompat");

        setTimeout(function(){
            trex.classList.remove("lompat");
        },500);
    }
}

let cek = setInterval(function(){

    let trexBottom = parseInt(window.getComputedStyle(trex).getPropertyValue("bottom"));
    let kaktusRight = parseInt(window.getComputedStyle(kaktus).getPropertyValue("right"));

    if(kaktusRight > 560 && kaktusRight < 600 && trexBottom < 40){
        alert("Game Over!");
        kaktus.style.animation = "none";
    }

},10);