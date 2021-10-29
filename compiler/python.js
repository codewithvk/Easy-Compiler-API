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

async function deleteFiles(pyPath, inputPath, exePath) {
    if (fs.existsSync(pyPath)) {
        await fs.unlinkSync(pyPath);
    }

    if (fs.existsSync(inputPath)) {
        await fs.unlinkSync(inputPath);
    }

    if (fs.existsSync(exePath)) {
        await fs.unlinkSync(exePath);
    }
}

function getRunCommand(executable, input) {

    return `python3 ${executable} < ${input}`;


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

function getpyPath(fileName) {
    return `${path.join(__dirname, '..', 'upload', fileName)}.py`;
}

function getInputPath(fileName) {
    return `${path.join(__dirname, '..', 'upload', fileName)}-input.txt`;
}



function runProgram(exePath, inputPath) {
    return new Promise((resolve, reject) => {

        exec(getRunCommand(exePath, inputPath), (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}


function runProgramNoIP(exePath) {
    return new Promise((resolve, reject) => {

        exec(`python3 ${exePath}`, (error, stdout, stderr) => {

            if (error) {
              reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}
const PythonCompile = async (code, input) => {
    let state = {
        stdout: null,
        stderr: null,
        statusMes: "",
    }
    if (input.length > 0) {
        let uniqueFileName = uuid();
        let executePath = getExecutablePath(uniqueFileName)
        let pyPath = getpyPath(uniqueFileName)
        let ipPath = getInputPath(uniqueFileName)

        await saveFile(pyPath, code);
        await saveFile(ipPath, input);

        try {
            let { stdout, stderr } = await runProgram(pyPath, ipPath);
            state.stdout = stdout;
            state.stderr = stderr;
        } catch (err) {
            state.stderr = err.stderr;
            state.statusMes = "Compiler Error";
            deleteFiles(pyPath, ipPath, executePath);
            return state;
        }
        if (state.stderr === '') {
            state.stderr = null;
        }
        state.statusMes = "Successfully Compiled";
        await deleteFiles(pyPath, ipPath, executePath);
        return state;
    } else {
        let uniqueFileName = uuid();
        let executePath = getExecutablePath(uniqueFileName)
        let pyPath = getpyPath(uniqueFileName)
        await saveFile(pyPath, code);
        try {
            let { stdout, stderr } = await runProgramNoIP(pyPath);
            state.stdout = stdout;
            state.stderr = stderr;
        } catch (err) {
            state.stderr = err.stderr;
            state.statusMes = "Compiler Error";
            deleteFiles(pyPath, executePath);
            return state;
        }
        if (state.stderr === '') {
            state.stderr = null;
        }
        state.statusMes = "Successfully Compiled";
        await deleteFiles(pyPath, executePath);
        return state;

    }
    return state;

}




module.exports = { PythonCompile };
