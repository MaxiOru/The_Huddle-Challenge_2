//Crear tablero

let dimension, matriz_tablero, matriz_boleano, tablero, inicio_x, inicio_y,fin_x,fin_y;

function crear_tablero (){
    matriz_tablero=[]
    dimension = parseInt(prompt("Ingrese el tamaño del tablero"));
    for (let i=0; i<dimension; i++){
        let fila = [];
        for (let j=0; j<dimension; j++){
            fila.push("⬜");
        }
        matriz_tablero.push(fila);
    }
    while(true){
        inicio_x = parseInt(prompt(`Ingrese la fila del punto de partida, del 0 al ${dimension-1}`))
        inicio_y = parseInt(prompt(`Ingrese la columna del punto de partida, del 0 al ${dimension-1}`))
        if(inicio_x>=0 && inicio_x<dimension && inicio_y>=0 && inicio_y<dimension){
            break
        }
    }
        while(true){
        fin_x = parseInt(prompt(`Ingrese la fila del destion, del 0 al ${dimension-1}`))
        fin_y = parseInt(prompt(`Ingrese la columna del destino, del 0 al ${dimension-1}`))
        if(fin_x>=0 && fin_x<dimension && fin_y>=0 && fin_y<dimension && ( inicio_x!==fin_x || inicio_y!==fin_y)){
            break
        }
    }

    matriz_tablero[inicio_x][inicio_y]="🟨"
    matriz_tablero[fin_x][fin_y]="🟧"

    poner_osbtaculos()
    document.getElementById("tablero").innerHTML=imprimir_tablero()
}

//funcion imprimir tablero

function imprimir_tablero(){
    let tablero = "";
    for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
            tablero += `<span style="cursor:pointer;" onclick="marcar_celda(${i},${j})">${matriz_tablero[i][j]}</span>`;
        }
        tablero += "<br>";
    }
    return tablero;
}
let mov_x, mov_y, contador, bandera, cantidad, coord_x, coord_y, nx, ny;
//funcion poner obstaculos
function poner_osbtaculos(){

    matriz_boleano=[]
    for(let i=0; i<dimension; i++){
        let fila=[]
        for (let j=0; j<dimension; j++){
            fila.push(false);
        }
        matriz_boleano.push(fila)
    }
    // matriz_boleano[inicio_x][inicio_y]=true

    cantidad=Math.floor(dimension*dimension*0.15);
    contador=0
    mov_x =[1,-1,0,0,1,1,-1,-1]
    mov_y =[0,0,-1,1,1,-1,1,-1]

    while(contador<cantidad){
        bandera=0
        coord_x= Math.floor(Math.random()*dimension)
        coord_y= Math.floor(Math.random()*dimension)
        for (let i=0; i<8; i++){
            nx= coord_x + mov_x[i]
            ny= coord_y + mov_y[i]
            if((coord_x===inicio_x && coord_y===inicio_y) || (coord_x===fin_x && coord_y===fin_y)){
                bandera=1
                continue
            }
            if(nx>=0 && nx<dimension && ny>=0 && ny<dimension){

                if (matriz_boleano[nx][ny]===true || matriz_boleano[coord_x][coord_y]===true){
                    bandera=1
                    continue
                }
            }
        }
        if(bandera===0){

            matriz_boleano[coord_x][coord_y]=true;
            let valor = Math.floor(Math.random() * 2);
            if (valor === 0) {
                matriz_tablero[coord_x][coord_y] = "🟦";
            } 
            else if (valor === 1) {
                matriz_tablero[coord_x][coord_y] = "🟫";
            }
            contador += 1;
        }
    }
}
//resolver tablero BFS

let matriz_visitado, ruta, dir_x, dir_y, cola, fila, columna, actual;
function mostrar_camino(){
    //se crea una cola para hacer fifo
    limpiar_ruta();
    cola=[]
    //se crea una matriz de boleanos para ir visitando todos solo una vez
    matriz_visitado=[]
    for (let i=0;i<dimension; i++){
        let fila=[]
        for (let j=0; j<dimension; j++){
            fila.push(false)
        }
        matriz_visitado.push(fila)
    }
    const camino = new Map();
    cola.push([inicio_x,inicio_y])
    matriz_visitado[inicio_x][inicio_y]=true

    dir_x=[0,0,1,-1]
    dir_y=[1,-1,0,0]
    while(cola.length!==0){
        actual=cola.shift()
        fila=actual[0]
        columna=actual[1]
        if (fila===fin_x && columna===fin_y){
            break
        }
        for (let i=0; i<4; i++){
            let nueva_fila=fila+dir_x[i]
            let nueva_columna=columna+dir_y[i]
            if(nueva_fila<0 || nueva_fila>=dimension || nueva_columna<0 || nueva_columna>=dimension){
                continue
            }
            if(matriz_visitado[nueva_fila][nueva_columna]){
                continue
            }
            if(matriz_boleano[nueva_fila][nueva_columna] ){
                continue
            }
            matriz_visitado[nueva_fila][nueva_columna]=true
            cola.push([nueva_fila,nueva_columna])
            camino.set(nueva_fila+","+nueva_columna,[fila,columna])
        }
    }
    ruta =[]
    actual=[fin_x,fin_y]
    while(!(actual[0]===inicio_x && actual[1]===inicio_y)){
        ruta.push([actual[0],actual[1]])
        actual=camino.get(actual[0]+","+actual[1])
    }
    ruta.push([inicio_x,inicio_y])
    ruta.reverse()
    for(let i=0; i<ruta.length; i++){
        let valor=ruta[i]
        matriz_tablero[valor[0]][valor[1]]="🟩"
    }
    document.getElementById("tablero").innerHTML=imprimir_tablero()

}

function marcar_celda(i, j) {
    // No permitir cambiar inicio ni fin
    if ((i === inicio_x && j === inicio_y) || (i === fin_x && j === fin_y)) return;

    if (matriz_boleano[i][j]) {
        matriz_boleano[i][j] = false;
        matriz_tablero[i][j] = "⬜";
    } else {
        matriz_boleano[i][j] = true;
        matriz_tablero[i][j] = "🟥";
    }
    document.getElementById("tablero").innerHTML = imprimir_tablero();
}

function limpiar_ruta() {
    for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
            // Solo limpia las celdas que son parte de la ruta anterior (🟩)
            if (matriz_tablero[i][j] === "🟩") {
                matriz_tablero[i][j] = "⬜";
            }
        }
    }
}
