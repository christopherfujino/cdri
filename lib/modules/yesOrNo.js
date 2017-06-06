import rl from './rl.js'

export default function (query, cb) {  // yesOrNo()
  rl.question(query, (string) => {
    string = string.toLowerCase().trim()
    if (string === 'y' || string === 'yes') {
      cb(true)
    } else if (string === 'n' || string === 'no') {
      cb(false)
    } else {
      rl.write('yolo!')
    }
  })
}
