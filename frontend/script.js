function openForm() {
    document.getElementById("configModal").style.display = "block";
}

function closeForm() {
    document.getElementById("configModal").style.display = "none";
}

function saveConfig() {
    const numTanks = document.getElementById("numTanks").value;
    const tank1Comm = document.getElementById("tank1Comm").value;
    const tank2Comm = document.getElementById("tank2Comm").value;

    // You can store these values in a variable or send them to the server
    console.log(`Number of Tanks: ${numTanks}`);
    console.log(`Tank 1 Communication Data: ${tank1Comm}`);
    console.log(`Tank 2 Communication Data: ${tank2Comm}`);

    // Close the modal after saving
    closeForm();
}
function openForm() {
    document.getElementById("configModal").style.display = "block";
}

function closeForm() {
    document.getElementById("configModal").style.display = "none";
}

function saveConfig() {
    const numTanks = document.getElementById("numTanks").value;
    const tank1Water = document.getElementById("tank1Water").checked;
    const tank1Air = document.getElementById("tank1Air").checked;
    const tank1Pressure = document.getElementById("tank1Pressure").checked;
    const tank2Water = document.getElementById("tank2Water").checked;
    const tank2Air = document.getElementById("tank2Air").checked;
    const tank2Pressure = document.getElementById("tank2Pressure").checked;

    console.log(`Number of Tanks: ${numTanks}`);
    console.log(`Tank 1 - Water quality: ${tank1Water}, Air quality: ${tank1Air}, Pressure: ${tank1Pressure}`);
    console.log(`Tank 2 - Water quality: ${tank2Water}, Air quality: ${tank2Air}, Pressure: ${tank2Pressure}`);

    // Close the modal after saving
    closeForm();
}
function openForm1() {
    document.getElementById("configModal1").style.display = "block";
}

function closeForm1() {
    document.getElementById("configModal1").style.display = "none";
}

function openForm2() {
    document.getElementById("configModal2").style.display = "block";
}

function closeForm2() {
    document.getElementById("configModal2").style.display = "none";
}
function openForm3() {
    document.getElementById("configModal3").style.display = "block";
}

function closeForm3() {
    document.getElementById("configModal3").style.display = "none";
}
function openFormAT1() {
    document.getElementById("configModalAT1").style.display = "block";
}

function closeFormAT1() {
    document.getElementById("configModalAT1").style.display = "none";
}
function openFormAT2() {
    document.getElementById("configModalAT2").style.display = "block";
}
function closeFormAT2() {
    document.getElementById("configModalAT2").style.display = "none";
}
function openFormAT3() {
    document.getElementById("configModalAT3").style.display = "block";
}

function closeFormAT3() {
    document.getElementById("configModalAT3").style.display = "none";
}
