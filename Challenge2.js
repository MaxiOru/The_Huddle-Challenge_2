//CLASE CELDA, creamos la clse celda que despues se usa para crear tablero, poner inicio y fin, poner obstaculos

class Celda {
  constructor(valor = "⬜") {
    this.valor = valor;
  }

  cambiar(valor) {
    this.valor = valor;
  }

  mostrar() {
    return this.valor;
  }

  esBloqueada() {
    return ["🟥", "🟦", "🟫"].includes(this.valor);
  }

  esInicio() {
    return this.valor === "🟨";
  }

  esFin() {
    return this.valor === "🟧";
  }
}

// CLASE MAPA, sea inicializa el mapa y se crea ya el tablero segun la dimension que se le pase

class Mapa {
  constructor(dimension) {
    this.dimension = dimension;
    this.matriz = [];
    this.inicio = null;
    this.fin = null;
    this.crearCeldas();
  }

  crearCeldas() {
    for (let i = 0; i < this.dimension; i++) {
      const fila = [];
      for (let j = 0; j < this.dimension; j++) {
        fila.push(new Celda());
      }
      this.matriz.push(fila);
    }
  }

  colocarInicio(x, y) {
    this.inicio = [x, y];
    this.matriz[x][y].cambiar("🟨");
  }

  colocarFin(x, y) {
    this.fin = [x, y];
    this.matriz[x][y].cambiar("🟧");
  }

  colocarObstaculo(x, y, tipo = "🟥") {
    if (!this.esInicio(x, y) && !this.esFin(x, y)) {
      this.matriz[x][y].cambiar(tipo);
    }
  }

  esInicio(x, y) {
    return this.inicio && this.inicio[0] === x && this.inicio[1] === y;
  }

  esFin(x, y) {
    return this.fin && this.fin[0] === x && this.fin[1] === y;
  }

  mostrar(marcaLaCelda) {
    let html = "";
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        html += `<span style="cursor:pointer;" onclick="${marcaLaCelda}(${i}, ${j})">${this.matriz[i][j].mostrar()}</span>`;
      }
      html += "<br>";
    }
    return html;
  }

  limpiarRuta() {
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        if (this.matriz[i][j].mostrar() === "🟩") {
          this.matriz[i][j].cambiar("⬜");
        }
      }
    }
  }

  aleatorizarObstaculos(porcentaje = 0.15) {
    const cantidad = Math.floor(this.dimension * this.dimension * porcentaje);
    const dx = [1, -1, 0, 0, 1, 1, -1, -1];
    const dy = [0, 0, -1, 1, 1, -1, 1, -1];
    const bloqueos = ["🟫", "🟦"];
    let colocados = 0;

    while (colocados < cantidad) {
      const x = Math.floor(Math.random() * this.dimension);
      const y = Math.floor(Math.random() * this.dimension);

      if (this.esInicio(x, y) || this.esFin(x, y)) continue;

      let adyacente = false;
      for (let i = 0; i < 8; i++) {
        const nx = x + dx[i];
        const ny = y + dy[i];
        if (nx >= 0 && ny >= 0 && nx < this.dimension && ny < this.dimension) {
          if (this.matriz[nx][ny].esBloqueada()) {
            adyacente = true;
            break;
          }
        }
      }

      if (!adyacente && this.matriz[x][y].mostrar() === "⬜") {
        const tipo = bloqueos[Math.floor(Math.random() * bloqueos.length)];
        this.colocarObstaculo(x, y, tipo);
        colocados++;
      }
    }
  }
}

//CLASE CALCULADORA DE RUTA

class CalculadoraDeRutas {
  constructor(mapa) {
    this.mapa = mapa;
  }

  buscarRuta() {
    const [sx, sy] = this.mapa.inicio;
    const [fx, fy] = this.mapa.fin;
    const dimension = this.mapa.dimension;
    const visitado = Array.from({ length: dimension }, () => Array(dimension).fill(false));
    const camino = new Map();
    const cola = [[sx, sy]];
    visitado[sx][sy] = true;

    const dx = [0, 0, 1, -1];
    const dy = [1, -1, 0, 0];

    while (cola.length) {
      const [x, y] = cola.shift();
      if (x === fx && y === fy) break;

      for (let i = 0; i < 4; i++) {
        const nx = x + dx[i];
        const ny = y + dy[i];
        if (nx < 0 || ny < 0 || nx >= dimension || ny >= dimension) continue;
        if (visitado[nx][ny]) continue;
        if (this.mapa.matriz[nx][ny].esBloqueada()) continue;

        visitado[nx][ny] = true;
        cola.push([nx, ny]);
        camino.set(`${nx},${ny}`, [x, y]);
      }
    }

    let actual = [fx, fy];
    const ruta = [];

    while (!(actual[0] === sx && actual[1] === sy)) {
      ruta.push(actual);
      actual = camino.get(`${actual[0]},${actual[1]}`);
      if (!actual) return; // No se encontró ruta
    }

    ruta.reverse();
    for (const [x, y] of ruta) {
      if (!this.mapa.esInicio(x, y) && !this.mapa.esFin(x, y)) {
        this.mapa.matriz[x][y].cambiar("🟩");
      }
    }
  }
}

// CLASE CONTROLADOR, sea crea la clase donde tanto como mapa y ruta estan vacias y se da inicio cuando se aprita el boton crear mapa, pide dimension, se crea el objeto this.mapa luego se pide inicio y fin y con el metodo de this.mapa se coloca el inicio y fin. Luego se coloca aleatoriamente los obstaculos y se crea el objto calculadora de ruta

class ControladorApp {
  constructor() {
    this.mapa = null;
    this.rutero = null;
  }
  //se le llama cuando se da click al boton generar mapa
  iniciar() {
    const dimension = parseInt(prompt("Ingrese el tamaño del tablero:"));
    this.mapa = new Mapa(dimension);

    const [ix, iy] = this.pedirCoordenada("inicio", dimension);
    this.mapa.colocarInicio(ix, iy);

    const [fx, fy] = this.pedirCoordenada("fin", dimension, [ix, iy]);
    this.mapa.colocarFin(fx, fy);

    this.mapa.aleatorizarObstaculos();
    this.rutero = new CalculadoraDeRutas(this.mapa);
    this.renderizar();
  }
  // se le llama en el metodo iniciar cuando se pide las coordenadas de inicio y fin
  pedirCoordenada(tipo, dimension, noIgual = null) {
    let x, y;
    do {
      x = parseInt(prompt(`Ingrese fila para ${tipo} (0 a ${dimension - 1}):`));
      y = parseInt(prompt(`Ingrese columna para ${tipo} (0 a ${dimension - 1}):`));
    } while (x < 0 || x >= dimension || y < 0 || y >= dimension || (noIgual && x === noIgual[0] && y === noIgual[1]));
      return [x, y];
  }

  mostrarRuta() {
    this.mapa.limpiarRuta();
    this.rutero.buscarRuta();
    this.renderizar();
  }

  marcarCelda(x, y) {
    if (!this.mapa.esInicio(x, y) && !this.mapa.esFin(x, y)) {
      const celda = this.mapa.matriz[x][y];
      if (celda.esBloqueada()) {
        celda.cambiar("⬜");
      } else {
        celda.cambiar("🟥");
      }
    }
    this.renderizar();
  }

  renderizar() {
    const html = this.mapa.mostrar("app.marcarCelda");
    document.getElementById("tablero").innerHTML = html;
  }
}

const app = new ControladorApp();

