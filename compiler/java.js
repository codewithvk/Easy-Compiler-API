const { v4: uuid } = require('uuid');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const saveFile = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve([file]);
            }
        });
    });
};

async function deleteFiles(javaPath, inputPath, exePath) {
    if (fs.existsSync(javaPath)) {
        await fs.unlinkSync(javaPath);
    }

    if (fs.existsSync(inputPath)) {
        await fs.unlinkSync(inputPath);
    }

    if (fs.existsSync(exePath)) {
        await fs.unlinkSync(exePath);
    }
}



function getExecutablePath(fileName) {
    // console.log(os.platform());
    if (os.platform() === 'win32') {
        return `${path.join(__dirname, '..', 'upload', fileName)}.exe`;
    }
    if (os.platform() === 'linux') {
        return `${path.join(__dirname, '..', 'upload', fileName)}`;
    }
}

function getRunCommand(input, CentralClass) {

    let path = getExecutablePath("")
    return `cd ${path} && \  java ${CentralClass} < ${input}`;

}

function getjavaPath(fileName) {
    return `${path.join(__dirname, '..', 'upload', fileName)}.java`;
}

function getInputPath(fileName) {
    return `${path.join(__dirname, '..', 'upload', fileName)}-input.txt`;
}

function compileProgram(javaPath) {
    return new Promise((resolve, reject) => {
        exec(`javac ${javaPath}`, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

function runProgram(inputPath, CentralClass) {
    return new Promise((resolve, reject) => {
        exec(getRunCommand(inputPath, CentralClass), (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}


const javaCompile = async (code, input, CentralClass) => {
    let state = {
        stdout: null,
        stderr: null,
        statusMes: "",
    }
    let uniqueFileName = uuid();
    // let executePath = getExecutablePath(uniqueFileName)
    let javaPath = getjavaPath(uniqueFileName)
    let ipPath = getInputPath(uniqueFileName)

    await saveFile(javaPath, code);
    await saveFile(ipPath, input);

    try {
        let { stdout, stderr } = await compileProgram(javaPath);
    } catch (err) {
        state.stderr = err.stderr;
        state.statusMes = "Compiler Error";
        deleteFiles(javaPath, ipPath);
        return state;
    }

    try {
        let { stdout, stderr } = await runProgram(ipPath, CentralClass);
        state.stdout = stdout;
        state.stderr = stderr;

    } catch (err) {
        state.stderr = err.stderr;
        state.statusMes = "Run Time Error";
        deleteFiles(javaPath, ipPath);
    }

    if (state.stderr === '') {
        state.stderr = null;
    }
    state.statusMes = "Successfully Compiled";
    await deleteFiles(javaPath, ipPath);
    return state;

}




module.exports = { javaCompile };
