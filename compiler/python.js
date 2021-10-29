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

async function deleteFiles(cppPath, inputPath, exePath) {
    if (fs.existsSync(cppPath)) {
        await fs.unlinkSync(cppPath);
    }

    if (fs.existsSync(inputPath)) {
        await fs.unlinkSync(inputPath);
    }

    if (fs.existsSync(exePath)) {
        await fs.unlinkSync(exePath);
    }
}

function getRunCommand(executable, input) {
    return `python ${executable} < ${input}`;
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

function getCPPPath(fileName) {
    return `${path.join(__dirname, '..', 'upload', fileName)}.py`;
}

function getInputPath(fileName) {
    return `${path.join(__dirname, '..', 'upload', fileName)}-input.txt`;
}

function compileProgram(cppPath, exePath, inputPath) {
    return new Promise((resolve, reject) => {
        exec(`python ${cppPath} `, (error, stdout, stderr) => {
            if (error) {
                console.log({ error, stdout, stderr })

                reject({ error, stdout, stderr });
            } else {
                console.log({ stdout, stderr })
                resolve({ stdout, stderr });
            }
        });
    });
}

function runProgram(exePath, inputPath) {
    return new Promise((resolve, reject) => {

        exec(getRunCommand(exePath, inputPath), (error, stdout, stderr) => {
            if (error) {
                console.log({ error, stdout, stderr })

                reject({ error, stdout, stderr });
            } else {
                console.log({ stdout, stderr })

                resolve({ stdout, stderr });
            }
        });
    });
}


function runProgramNoIP(exePath) {
    return new Promise((resolve, reject) => {

        exec(`python ${exePath}`, (error, stdout, stderr) => {
            if (error) {
                console.log({ error, stdout, stderr })

                reject({ error, stdout, stderr });
            } else {
                console.log({ stdout, stderr })

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
        let cppPath = getCPPPath(uniqueFileName)
        let ipPath = getInputPath(uniqueFileName)

        await saveFile(cppPath, code);
        await saveFile(ipPath, input);

        try {
            let { stdout, stderr } = await runProgram(cppPath, ipPath);
            state.stdout = stdout;
            state.stderr = stderr;
        } catch (err) {
            state.stderr = err.stderr;
            state.statusMes = "Compiler Error";
            console.log({ err });
            deleteFiles(cppPath, ipPath, executePath);
            return state;
        }
        if (state.stderr === '') {
            state.stderr = null;
        }
        state.statusMes = "Successfully Compiled";
        await deleteFiles(cppPath, ipPath, executePath);
        return state;
    } else {
        let uniqueFileName = uuid();
        let executePath = getExecutablePath(uniqueFileName)
        let cppPath = getCPPPath(uniqueFileName)


        await saveFile(cppPath, code);


        try {
            let { stdout, stderr } = await runProgramNoIP(cppPath);
            state.stdout = stdout;
            state.stderr = stderr;
        } catch (err) {
            state.stderr = err.stderr;
            state.statusMes = "Compiler Error";
            console.log({ err });
            deleteFiles(cppPath, executePath);
            return state;
        }
        if (state.stderr === '') {
            state.stderr = null;
        }
        state.statusMes = "Successfully Compiled";
        await deleteFiles(cppPath, executePath);
        return state;

    }
    return state;

}




module.exports = { PythonCompile };
