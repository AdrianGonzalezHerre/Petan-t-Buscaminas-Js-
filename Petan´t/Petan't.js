(function () {
    const petadores = 25;
    const ancho = 10;
    const alto = 10;
    const squareSize = 34;
    const fuente = squareSize * 0.5;
    var clickMode = 'normal';
    var canvas;
    var contexto;
    var tablero;
    var pierde = false;

    const aroundOffsets = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    const colores = [
        'transparent',
        'green',
        'blue',
        'magenta',
        'red',
        'purple',
        'orange',
        'cyan',
        'black'
    ];

    var minaImage;
    var banderaimg



    function Cuadro() {
        this.peta = false;
        this.contador = 0;
        this.descubierto = true;
        this.bandera = false;
    }

    function createCanvas() {
        const e = document.createElement('canvas');
        e.width = ancho * squareSize;
        e.height = alto * squareSize;
        document.getElementById('tablero').appendChild(e);
        return e;
    }

    function randomPosition() {
        return [
            parseInt(Math.floor(Math.random() * ancho)),
            parseInt(Math.floor(Math.random() * alto))
        ];
    }

    function prepararTablero() {
        const espacio = ancho * alto;
        tablero = [];
        while (tablero.length < espacio) {
            tablero.push(new Cuadro());
        }

        for (let idx = 0; idx < petadores; idx++) {
            let [x, y] = randomPosition();
            let index = x + (y * ancho);

            if (index >= 0 && index < espacio) {
                if (!tablero[index].peta) {
                    tablero[index].peta = true;
                    iterateAround(x, y, (e) => {
                        if (!e.peta) {
                            e.contador += 1;
                        }
                    });
                }
            }
        }
    }

    function iterateAround(x, y, fn) {
        aroundOffsets.forEach(function (o) {
            const [ox, oy] = o;
            const ax = x + ox;
            const ay = y + oy;
            const index = ax + (ay * ancho);

            if (ax >= 0 && ax < ancho && ay >= 0 && ay < alto) {
                fn(tablero[index], ax, ay);
            }
        });
    }

    function crearMinas(ax, ay) {
        contexto.fillStyle = 'grey';
        contexto.fillRect(ax, ay, squareSize, squareSize);

        contexto.fillStyle = 'red';
        contexto.beginPath();
        contexto.arc(
            ax + squareSize / 2,
            ay + squareSize / 2,
            squareSize * 0.25,
            0,
            Math.PI * 2,
            false
        );
        contexto.closePath(); // Cierra el arco correctamente
        contexto.fill();
    }


    function crearTablero() {
        contexto.clearRect(0, 0, canvas.width, canvas.height);
    
        tablero.forEach(function (e, index) {
            const x = index % ancho;
            const y = Math.floor(index / ancho);
            const ax = x * squareSize;
            const ay = y * squareSize;
    
            if (e.descubierto) {
                contexto.strokeStyle = '#444';
                contexto.fillStyle = 'grey';
                contexto.fillRect(
                    x * squareSize,
                    y * squareSize,
                    squareSize,
                    squareSize
                );
    
                if (e.bandera) {
                    // Dibuja una bandera en la casilla si sq.bandera es true
                    crearbanderas(ax, ay);
                }
            } else if (e.peta) {
                crearMinas(ax, ay);
            } else {
                const text = e.contador.toString();
                const tamanoTexto = contexto.measureText(text);
    
                contexto.fillStyle = colores[e.contador];
                contexto.fillText(
                    text,
                    ax + (squareSize / 2 - tamanoTexto.width / 2),
                    ay + (squareSize / 2 - fuente / 2)
                );
            }
        });
    }
    


    function reset(){
        prepararTablero();
        crearTablero();
        pierde=false;
    }


    function onMouseDown(e) {
        const ax = e.clientX - canvas.offsetLeft;
        const ay = e.clientY - canvas.offsetTop;
        const x = parseInt(Math.floor(ax / squareSize));
        const y = parseInt(Math.floor(ay / squareSize));
    
        if (pierde) {
            return;
        }
    
        if (x >= 0 && x < ancho && y >= 0 && y < alto) {
            const index = x + y * ancho;
            const sq = tablero[index];
    
            if (clickMode === 'discover') {
                if (!sq.descubierto && sq.contador > 0) {
                    reveal(x, y);
                }
            } else if (clickMode === 'flag') {
                sq.bandera = !sq.bandera;
            } else if (clickMode === 'normal') {
                if (!sq.bandera) { // Agrega esta condición para verificar si no hay una bandera
                    if (sq.descubierto) {
                        if (sq.peta) {
                            sq.descubierto = false;
                            pierde = true;
                        } else if (sq.contador === 0) {
                            sq.descubierto = false;
                            revealVacio(x, y);
                        } else {
                            sq.descubierto = false;
                            // Aquí puedes agregar la lógica que deseas ejecutar
                            // cuando se hace clic en una casilla con contador diferente de 0.
                        }
                    }
                }
            }
    
            // Llama a crearTablero para actualizar el tablero después del clic.
            crearTablero();
        }
    }
    
    






    function crearbanderas(ax, ay) {
        contexto.lineWidth = 2;
        contexto.fillStyle = 'green';
        contexto.beginPath();
        contexto.arc(
            ax + squareSize / 2,
            ay + squareSize / 2,
            squareSize * 0.25,
            0,
            Math.PI * 2,
            0
        );
        contexto.closePath(); // Agrega esta línea para cerrar el arco
        contexto.fill();
    }


    function onLoad() {
        canvas = createCanvas();
        contexto = canvas.getContext('2d');
        contexto.textBaseline = 'top';
        contexto.font = `bold ${fuente}px Arial`;



        document.querySelectorAll('input[type=radio]').forEach((e, idx) => {
            if (idx == 0) {
                e.checked = true;
            }
            e.addEventListener('change', (evt) => {
                clickMode = evt.target.value;
            });
        });

        canvas.addEventListener('mousedown', onMouseDown);
        document.getElementById('reset').addEventListener('click',reset);
        prepararTablero();
        crearTablero();
    }

    function reveal(x, y) {
        iterateAround(x, y, (e) => {
            if (!e.bandera && e.descubierto) {
                e.descubierto = false;
                if (e.peta) {
                    pierde = true;
                }
            }
        });
        crearTablero();
    }

    function revealVacio(x, y) {
        const queue = [[x, y]];
        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            iterateAround(cx, cy, (e, x, y) => {
                if (e.descubierto && !e.bandera) {
                    e.descubierto = false;
                    if (e.contador === 0) {
                        queue.push([x, y]);
                    }
                }
            });
        }
    }


    window.addEventListener('load', onLoad);
})();
