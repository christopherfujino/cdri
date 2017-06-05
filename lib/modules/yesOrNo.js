let callback

const getInput = function (chunk) {
  const string = chunkToString(chunk).toLowerCase()
  process.stdin.removeAllListeners()
  if (string === 'y' || string === 'yes') {
    callback(true)
  } else if (string === 'n' || string === 'no'){
    callback(false)
  } else {
    console.log('Invalid input! Enter either "y" or "n": ')
    process.stdin.on('data', getInput)
  }
}

const chunkToString = function (chunk) {
  let string = '' + chunk
  return string.split('\n')[0]
}

export default function (cb) {  // yesOrNo()
  callback = cb
  process.stdin.removeAllListeners('data')
  process.stdin.on('data', getInput)
}
