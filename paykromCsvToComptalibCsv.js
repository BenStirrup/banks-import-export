/* 
Requirements : 
- `csv` module installed (doc : https://csv.js.org/)
Usage :
$ node paykromCsvToComptalibCsv.js <source>.csv <output>.csv
*/

const csv = require('csv')
const fs = require('fs')

const args = process.argv.slice(2)
const sourcePath = args[0]
const outputPath = args[1]

const file = fs.readFileSync(sourcePath, 'utf8')
const writeStream = fs.createWriteStream(outputPath)

csv
  .parse(file, { columns: true, delimiter: ';' })
  .pipe(
    csv.transform((record) => {
      const { tiers, libelle, reference, date, debit, credit } = record
      let designation = ''
      // Merge the columns tiers, libelle and reference
      if (tiers) designation += tiers.trim() + ' '
      if (libelle) designation += libelle.trim() + ' '
      if (reference) designation += reference.trim()
      // Format date to dd-mm-yyyy
      const formattedDate = new Date(date)
        .toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        .replace(new RegExp('/', 'g'), '-')
      const newRecord = { designation, date: formattedDate, debit, credit }
      return newRecord
    })
  )
  .pipe(
    csv.stringify({
      header: true,
      columns: [
        { key: 'designation' },
        { key: 'date' },
        { key: 'debit' },
        { key: 'credit' }
      ],
      delimiter: ';'
    })
  )
  .pipe(writeStream)
