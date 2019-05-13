(() => {
    var canvas = document.getElementById("canvas");

    var ctx = canvas.getContext("2d");
    var input = document.getElementById("input");
    var register = document.getElementById("register");

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    let onX = 0;
    let onY = 0;
    let userDrawing = false;
    let userTouched = false;

    function draw(e) {
        if (!userDrawing) return;
        ctx.beginPath();
        ctx.moveTo(onX, onY);
        ctx.lineTo(e.offsetX, e.offsetY);
        onX = e.offsetX;
        onY = e.offsetY;
        ctx.stroke();
    }

    canvas.addEventListener(`mousedown`, e => {
        userTouched = true;
        userDrawing = true;
        onX = e.offsetX;
        onY = e.offsetY;
    });
    canvas.addEventListener(`mousemove`, draw);

    canvas.addEventListener(`mouseup`, () => {
        userTouched = true;
        userDrawing = false;
    });

    register.addEventListener(`click`, () => {
        if (userTouched) input.value = canvas.toDataURL();
    });
})();
