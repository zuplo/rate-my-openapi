const path = require('path')
const fs = require('fs')

const pkgPath = path.resolve(process.cwd(), process.argv[2])
const json = fs.readFileSync(pkgPath, 'utf-8')
const pkg = JSON.parse(json)
pkg.version = process.env.GITHUB_REF.replace('refs/tags/v', '')
const outJson = JSON.stringify(pkg, undefined, 2)
fs.writeFileSync(pkgPath, outJson, 'utf-8')