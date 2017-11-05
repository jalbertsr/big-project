const express = require('express')
const azure = require('azure-storage')
const fs = require('fs')
require('dotenv').load()

const PORT = process.env.PORT || 3002

const app = express()

console.log(`AZURE_STORAGE_ACCOUNT -> ${process.env.AZURE_STORAGE_ACCOUNT}`)
console.log(`AZURE_STORAGE_ACCESS_KEY -> ${process.env.AZURE_STORAGE_ACCESS_KEY}`)
console.log(`AZURE_STORAGE_CONNECTION_STRING -> ${process.env.AZURE_STORAGE_CONNECTION_STRING}`)

const blobSvc = azure.createBlobService()

// Create a container
app.post('/blobservice/createContainer/:containerName', (req, res) => {
  const { containerName } = req.params

  blobSvc.createContainerIfNotExists(containerName, function (error, result, response) {
    if (result.created) {
      console.log(`Container '${containerName}' created successfully`)
      res.json({
        status: 'OK',
        message: `Container '${containerName}' created successfully`
      })
    } else {
      console.log(`Container '${containerName}' allready exists`)
      res.json({
        status: 'KO',
        message: `Container '${containerName}' allready exists`
      })
    }
    console.log(`Info response from blob service -> ${JSON.stringify(response)}`)
  })
})

// Upload a file(blob) in a container
app.post('/blobservice/createBlob/:containerName/:blobName', (req, res) => {
  const { containerName, blobName } = req.params
  blobSvc.createBlockBlobFromLocalFile(containerName, blobName, 'test.txt', function (error, result, response) {
    console.log(`${JSON.stringify(result)}`)
    res.json({
      status: 'OK',
      message: `Response from blob service -> ${result}`
    })
  })
})

// Get list of blobs in a container
app.get('/blobservice/getBlobs/:containerName', (req, res) => {
  const { containerName } = req.params
  blobSvc.listBlobsSegmented(containerName, null, function (error, result, response) {
    if (!error) {
      // If not all blobs were returned, result.continuationToken has the continuation token.
      console.log(`Result entries -> ${JSON.stringify(result.entries)}`)
      res.json({
        status: 'OK',
        data: result.entries
      })
    } else {
      console.log(`Unable to read result entries from container ${containerName}`)
      res.json({
        status: 'KO',
        message: `Unable to read result entries from container ${containerName}`
      })
    }
  })
})

// Download the file
app.get('/blobservice/downloadBlob/:containerName/:blobName', (req, res) => {
  const { containerName, blobName } = req.params
  blobSvc.getBlobToStream(containerName, blobName, fs.createWriteStream('output.txt'), function (error, result, response) {
    if (!error) res.download('output.txt')
    else throw new Error(error)
  })
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
