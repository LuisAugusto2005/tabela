var button, amt, container;
const labels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O",
                "P","Q","R","S","T","U","V","W","X","Y","Z"];

const operators = ["C","⇤","(",")","→","⌃","↔","⌄","¬","⊻","v","f","="];

const tooltips = ["Clear","Delete","Open parentesis","Close parentesis","If, then","And",
                    "If and only if (Iff)","Or","Negate","Exclusive Or","True","False","Generate result"];

const checkbox = document.getElementById("darkcheckbox");

var operation = [];

init();

function init(){
    checkbox.addEventListener("change", function() {
        if (this.checked) {
            document.body.classList.add("dark-mode");
            document.caculator.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    });
    
    document.querySelector('#elementos').addEventListener('input', (event) => {
        operation = [];
        for(var i = 0; i < event.target.value.length; i++){
            if(labels.includes(event.target.value[i] || operators.includes(event.target.value[i]))){
                operation.push(event.target.value[i]);
            }
        }
        updateOperation();
    });

    document.addEventListener('DOMContentLoaded', function () {
        const aboutUsBtn = document.getElementById('aboutUsBtn');
        const aboutUsMessage = document.getElementById('aboutUsMessage');
    
        aboutUsBtn.addEventListener('click', function() {
           
            aboutUsMessage.style.display = aboutUsMessage.style.display === 'none' ? 'block' : 'none';
        });
    });
    
    initLetters();
    initOperators();
}

function initLetters(){
    amt = Array.from( { length: labels.length }, () => document.createElement('button') );
    container = document.querySelector('.content');
    amt.forEach( (element, i) => {
        element.innerText = labels[i];
        element.addEventListener("click", () => insertValue(labels[i]));
        container.appendChild(element);

        addTooltip(element, 'Condition ' + labels[i]);

        switch(i){
            case 24:
                element.classList.add('y-condition');
                break;
            case 25:
                element.classList.add('z-condition');
                break;
            default:
                break;
        }
    });
}

function initOperators(){
    amt = Array.from( { length: operators.length }, () => document.createElement('button') );
    container = document.querySelector('.menu');
    amt.forEach( (element, i) => {
        element.innerText = operators[i];
        element.addEventListener("click", () => handleOperator(operators[i]));
        container.appendChild(element);

        addTooltip(element, tooltips[i]);

        element.classList.add("operator");
        
        if(i == 12){
            element.classList.add("equals");
        }
    });
}

function addTooltip(element, content){
    var tooltip = document.createElement('span');
    tooltip.textContent = content;
    tooltip.classList.add('tooltiptext');
    element.appendChild(tooltip);
}

function insertValue(value) {
    if(checkAvailability(value)){
        operation.push(value);
        updateOperation();
    }
}

function checkAvailability(value){
    if(value === ")"){
        var counterOpen = 0;
        var counterClose = 0;

        operation.forEach((char, i) => {
            if(operation[i] === "("){
                counterOpen++;
            } else if(operation[i] === ")"){
                counterClose++;
            }
        });

        if(counterOpen-1 < counterClose){
            return false;
        }
    }

    if(labels.includes(value)){
        if(labels.includes(operation[operation.length-1])){
            return false;
        } else{
            return true;
        }
    }

    if(operators.includes(value)){
        if(value === "¬"){
            if(operation[operation.length-1] === "¬" || labels.includes(operation[operation.length-1])){
                return false;
            }
        } else{
            if(operators.includes(operation[operation.length-1]) && operation[operation.length-1] !== "C" && !(value === "(" || value === ")") && operation[operation.length-1] !== ")"){
                return false;
            } else{
                return true;
            }
        }
    }

    return true;
}

function handleOperator(op) {
    if (op === "C") {
        operation = [];
        updateOperation(); 
    } else if (op === "⇤") {
        operation.pop();
        updateOperation();
    } else if (op === "="){
        gerarTabela();
    } else if (op === "v"){
        insertValue("1");
    } else if(op === "f"){
        insertValue("0");
    } else{
        insertValue(op);
    }
}

function updateOperation(){
    const input = document.querySelector("#elementos");
    input.value = operation.join('');
}

function gerarTabela() {
    const input = document.querySelector("#elementos").value;
    const letras = [...new Set(input.replace(/[^Condição A-Z]/g, ''))];
    const tabelaDiv = document.querySelector("#tabela");

    const debugMode = false;

    var tautologia = true;
    var contradicao = true;

    if (letras.length === 0) {
        tabelaDiv.innerHTML = "Digite uma expressão válida";
        return;
    }

    const linhas = Math.pow(2, letras.length);
    let html = "<table border='1'><thead><tr>";

    letras.forEach((letra) => {
        html += `<th>${letra}</th>`;
    });

    if(debugMode){
        html += `<th>Passo Condição A Passo</th><th>${document.querySelector('#elementos').value}</th></tr></thead><tbody>`;
    } else{
        html += `<th>${document.querySelector('#elementos').value}</th></tr></thead><tbody>`;
    }

    for (let i = 0; i < linhas; i++) {
        let valores = {};
        html += "<tr>";
        
        for (let j = 0; j < letras.length; j++) {
            const bit = (i >> (letras.length - j - 1)) & 1;
            valores[letras[j]] = bit === 1 ? 'F' : 'V';
            html += `<td>${valores[letras[j]]}</td>`;
        }

        let expressaoOriginal = input;
        Object.keys(valores).forEach(letra => {
            expressaoOriginal = expressaoOriginal.replace(new RegExp(letra, 'g'), valores[letra] === 'V' ? 'true' : 'false');
        });

        let expressaoConvertida = expressaoOriginal.replace(/¬/g, '!')
                                                   .replace(/\⌃/g, '&&')
                                                   .replace(/\⊻/g, '^')
                                                   .replace(/⌄/g, '||')
                                                   .replace(/→/g, '<=')
                                                   .replace(/1/g, 'true')
                                                   .replace(/0/g, 'false')
                                                   .replace(/↔/g, '===');

        let resultado;
        let passoAPasso = expressaoOriginal;
        try {
            resultado = eval(expressaoConvertida) ? 'V' : 'F';
            passoAPasso = expressaoOriginal + " → " + expressaoConvertida;
        } catch (e) {
            resultado = 'Erro';
        }

        if(debugMode){
            html += `<td>${passoAPasso}</td><td>${resultado}</td></tr>`;
        } else{
            html += `<td>${resultado}</td></tr>`;
        }
        
        if(resultado === 'F'){
            tautologia = false;
        } else if (resultado === 'V'){
            contradicao = false;
        }
    }

    const tautologiaText = document.querySelector('.tautologia');
    const footer = document.querySelector('.footer');

    if(tautologia && !contradicao){
        tautologiaText.innerText = 'A sentenca é uma tautologia';
    } else if(contradicao && !tautologia){
        tautologiaText.innerText = 'A sentenca é uma contradição';
    } else if(!contradicao && !tautologia){
        tautologiaText.innerText = 'A sentenca é uma contigencia';
    }
    tautologiaText.classList.add('tautologiaVisible');
    footer.classList.add('footerAnimate');

    html += "</tbody></table>";
    tabelaDiv.innerHTML = html;

    
    

}

